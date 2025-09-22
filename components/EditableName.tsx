
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface EditableNameProps {
  initialName: string;
  onNameChange: (newName: string) => void;
  className?: string;
  inputClassName?: string;
}

const EditableName: React.FC<EditableNameProps> = ({ initialName, onNameChange, className, inputClassName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim() && name.trim() !== initialName) {
      onNameChange(name.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(initialName);
      setIsEditing(false);
    }
  };

  const handleStartEditing = () => {
    setName(initialName);
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span onClick={handleStartEditing} className={`${className} cursor-pointer`}>
      {initialName}
    </span>
  );
};

export default EditableName;