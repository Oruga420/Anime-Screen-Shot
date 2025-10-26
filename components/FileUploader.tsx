import React, { useState, useCallback } from 'react';
import { UploadIcon, FileIcon } from './Icons';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileCount, setSelectedFileCount] = useState(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    // Fix: Explicitly type `file` as `File` to resolve TypeScript error.
    const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesSelected(files);
      setSelectedFileCount(files.length);
    }
  }, [onFilesSelected, disabled]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    // Fix: Explicitly type `file` as `File` to resolve TypeScript error.
    const files = Array.from(e.target.files || []).filter((file: File) => file.type.startsWith('image/'));
     if (files.length > 0) {
      onFilesSelected(files);
      setSelectedFileCount(files.length);
    }
  };

  const borderColor = disabled ? 'border-gray-600' : isDragging ? 'border-indigo-500' : 'border-gray-500';
  const textColor = disabled ? 'text-gray-500' : 'text-gray-400';
  const ringColor = isDragging ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-900' : '';

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`relative w-full p-8 text-center border-2 ${borderColor} border-dashed rounded-lg transition-all duration-300 ${ringColor} ${disabled ? 'cursor-not-allowed bg-gray-800' : 'cursor-pointer hover:border-indigo-400 bg-gray-800/50'}`}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />
      <div className={`flex flex-col items-center justify-center space-y-4 ${textColor}`}>
        <UploadIcon className="w-12 h-12" />
        <p className="text-lg font-semibold text-gray-200">
          {selectedFileCount > 0 ? `${selectedFileCount} image(s) selected` : "Drag & drop screenshots here, or click to select"}
        </p>
        <p className="text-sm">Batch processing ready. Upload as many as you want.</p>
      </div>
    </div>
  );
};
