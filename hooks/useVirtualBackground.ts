import { useState, useEffect, useRef } from 'react';
import { VirtualBackground } from '../types';

declare global {
  interface Window {
    SelfieSegmentation: any;
  }
}

const useVirtualBackground = (
  stream: MediaStream | null,
  options: VirtualBackground,
  isVideoEnabled: boolean,
) => {
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const processorRef = useRef<{
    videoElement: HTMLVideoElement;
    canvasElement: HTMLCanvasElement;
    canvasCtx: CanvasRenderingContext2D;
    segmentation: any;
    image?: HTMLImageElement;
    animationFrameId?: number;
    stopped: boolean;
  } | null>(null);

  useEffect(() => {
    const stopProcessing = () => {
      if (processorRef.current) {
        processorRef.current.stopped = true;
        if (processorRef.current.animationFrameId) {
          cancelAnimationFrame(processorRef.current.animationFrameId);
        }
        processorRef.current.segmentation?.close();
        processorRef.current.videoElement.pause();
        processorRef.current.videoElement.srcObject = null;
        processorRef.current = null;
      }
      // Stop all tracks on the processed stream to release resources
      if (processedStream) {
        processedStream.getTracks().forEach(track => track.stop());
        setProcessedStream(null);
      }
      setIsProcessing(false);
    };

    const startProcessing = async () => {
      if (!stream || !stream.getVideoTracks()[0] || !window.SelfieSegmentation || options.type === 'none') {
        stopProcessing();
        return;
      }

      setIsProcessing(true);
      stopProcessing(); // Stop any previous instance

      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.muted = true;
      
      const track = stream.getVideoTracks()[0];
      const { width, height } = track.getSettings();

      const canvasElement = document.createElement('canvas');
      canvasElement.width = width || 1280;
      canvasElement.height = height || 720;
      const canvasCtx = canvasElement.getContext('2d', { willReadFrequently: true });

      if (!canvasCtx) {
        console.error('Could not get 2D context from canvas');
        setIsProcessing(false);
        return;
      }

      const segmentation = new window.SelfieSegmentation({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      segmentation.setOptions({ modelSelection: 1 });

      let image: HTMLImageElement | undefined;
      if (options.type === 'image' && options.url) {
        image = new Image();
        image.crossOrigin = 'anonymous'; // Necessary for cross-origin images
        image.src = options.url;
        await new Promise((resolve, reject) => { 
            image!.onload = resolve;
            image!.onerror = reject;
         }).catch(e => {
            console.error("Failed to load background image:", options.url, e);
            stopProcessing();
            return;
        });
      }

      processorRef.current = {
        videoElement,
        canvasElement,
        canvasCtx,
        segmentation,
        image,
        stopped: false
      };
      
      const onResults = (results: any) => {
        if (processorRef.current?.stopped) return;

        const { canvasCtx, canvasElement, image: bgImage } = processorRef.current;
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Draw the mask first. This will act as a stencil.
        canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

        // Use "source-in" to draw the video on top of the mask. This clips the video to the person's shape.
        canvasCtx.globalCompositeOperation = 'source-in';
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        // Use "destination-over" to draw the background behind the now-isolated person.
        canvasCtx.globalCompositeOperation = 'destination-over';
        if (options.type === 'blur') {
          canvasCtx.filter = 'blur(10px)';
          canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        } else if (options.type === 'image' && bgImage) {
          canvasCtx.drawImage(bgImage, 0, 0, canvasElement.width, canvasElement.height);
        }
        
        canvasCtx.restore();
      };
      segmentation.onResults(onResults);

      await segmentation.initialize();
      
      const canvasStream = canvasElement.captureStream(30);
      // Add audio tracks from original stream to the new one
      const audioTracks = stream.getAudioTracks();
      if(audioTracks.length > 0) {
        audioTracks.forEach(track => canvasStream.addTrack(track.clone()));
      }
      setProcessedStream(canvasStream);

      const processVideo = async () => {
         if (processorRef.current?.stopped) return;
        try {
            await segmentation.send({ image: videoElement });
        } catch(e) {
            console.error("Segmentation error", e);
        }
        if (processorRef.current && !processorRef.current.stopped) {
             processorRef.current.animationFrameId = requestAnimationFrame(processVideo);
        }
      };

      const startWhenReady = () => {
        videoElement.removeEventListener('loadedmetadata', startWhenReady);
        videoElement.removeEventListener('canplay', startWhenReady);
        if (processorRef.current?.stopped) return;
        
        videoElement.play().then(() => {
          if (processorRef.current?.stopped) return;
          processVideo();
          setIsProcessing(false);
        }).catch(err => {
          console.error("Segmentation video failed to play:", err);
          stopProcessing();
        });
      };
      
      videoElement.addEventListener('loadedmetadata', startWhenReady);
      videoElement.addEventListener('canplay', startWhenReady);

      if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
        startWhenReady();
      }
    };

    startProcessing();

    return () => {
      stopProcessing();
    };
  }, [stream, options]);

  useEffect(() => {
    if (processorRef.current?.videoElement) {
      const video = processorRef.current.videoElement;
      if (isVideoEnabled && video.paused) {
        video.play().catch(e => console.error("Virtual background video failed to play on toggle:", e));
      } else if (!isVideoEnabled && !video.paused) {
        video.pause();
      }
    }
  }, [isVideoEnabled]);

  return { processedStream, isProcessing };
};

export default useVirtualBackground;