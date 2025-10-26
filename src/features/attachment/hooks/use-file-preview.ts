'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ACCEPTED, MAX_SIZE } from '../constants';
import { sizeInMB } from '../utils/size';

export type PreviewItem = {
  id: string;
  file: File;
  isImage: boolean;
  previewUrl?: string;
};

const IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg']);

export const useFilePreview = () => {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    };
  }, [items]);

  const validateAndSetFiles = (files: File[]): boolean => {
    // Check for oversized files
    const oversizedFile = files.find((file) => sizeInMB(file.size) > MAX_SIZE);
    if (oversizedFile) {
      const error = `File "${oversizedFile.name}" exceeds the maximum size of ${MAX_SIZE}MB`;
      setValidationError(error);
      toast.error(error);
      setItems([]); // Clear existing previews
      return false;
    }

    // Check for unsupported file types
    const unsupportedFile = files.find((file) => !ACCEPTED.includes(file.type));
    if (unsupportedFile) {
      const error = `File "${unsupportedFile.name}" has an unsupported file type`;
      setValidationError(error);
      toast.error(error);
      setItems([]); // Clear existing previews
      return false;
    }

    setValidationError(null);

    // Revoke old URLs to prevent memory leaks
    items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));

    const nextItems = files.map<PreviewItem>((file, idx) => {
      const isImage = IMAGE_MIME_TYPES.has(file.type);
      return {
        id: `${file.name}-${file.size}-${idx}-${crypto.randomUUID?.() ?? Math.random()}`,
        file,
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });

    setItems(nextItems);
    return true;
  };

  const removeItem = (id: string) => {
    let remainingFiles: File[] = [];
    setItems((prev) => {
      const removedItem = prev.find((i) => i.id === id);
      if (removedItem?.previewUrl) {
        URL.revokeObjectURL(removedItem.previewUrl);
      }

      const next = prev.filter((i) => i.id !== id);
      remainingFiles = next.map((i) => i.file);
      return next;
    });

    // If removing an item clears the last validation error, reset it
    setValidationError(null);
    return remainingFiles;
  };

  const clearAll = () => {
    // Revoke all URLs before clearing
    items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    setItems([]);
    setValidationError(null);
  };

  return {
    items,
    validationError,
    validateAndSetFiles,
    removeItem,
    clearAll,
  };
};
