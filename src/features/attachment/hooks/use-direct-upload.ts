'use client';

import { useCallback, useState } from 'react';
import { confirmUpload } from '../actions/confirm-upload';
import { generateUploadUrl } from '../actions/generate-upload-url';

export type UploadStatus =
  | 'idle'
  | 'requesting-url'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error';

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  attachmentId?: string;
}

interface UseDirectUploadReturn {
  files: UploadFile[];
  uploadFiles: (filesToUpload: File[]) => Promise<void>;
  retryFile: (fileId: string) => Promise<void>;
  cancelFile: (fileId: string) => void;
  clearAll: () => void;
  isUploading: boolean;
}

export function useDirectUpload(ticketId: string): UseDirectUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const xhrMap = new Map<string, XMLHttpRequest>();

  const generateFileId = (file: File) => {
    return `${file.name}-${file.size}-${Date.now()}`;
  };

  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<UploadFile>) => {
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
      );
    },
    [],
  );

  const uploadFileToS3 = (
    fileId: string,
    file: File,
    presignedUrl: string,
    headers: Record<string, string>,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrMap.set(fileId, xhr);

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          updateFileStatus(fileId, { progress: percentComplete });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
            ),
          );
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', presignedUrl);
      // Apply required signed headers (e.g., Content-Type, SSE)
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(file);
    });
  };

  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      if (filesToUpload.length === 0) return;

      setIsUploading(true);

      // Initialize file tracking
      const initialFiles = filesToUpload.map((file) => ({
        id: generateFileId(file),
        file,
        name: file.name,
        progress: 0,
        status: 'idle' as UploadStatus,
      }));

      setFiles((prev) => [...prev, ...initialFiles]);

      // Upload each file sequentially
      for (const uploadFile of initialFiles) {
        try {
          // Step 1: Request presigned URL
          updateFileStatus(uploadFile.id, { status: 'requesting-url' });

          const urlResponse = await generateUploadUrl(ticketId, {
            name: uploadFile.file.name,
            size: uploadFile.file.size,
            type: uploadFile.file.type,
          });

          if (urlResponse.status === 'ERROR') {
            updateFileStatus(uploadFile.id, {
              status: 'error',
              error: urlResponse.message,
            });
            continue;
          }

          const { url, headers, attachmentId } = urlResponse.data!;

          // Step 2: Upload to S3
          updateFileStatus(uploadFile.id, {
            status: 'uploading',
            attachmentId,
            progress: 0,
          });

          await uploadFileToS3(uploadFile.id, uploadFile.file, url, headers);

          // Step 3: Confirm upload with server
          updateFileStatus(uploadFile.id, { status: 'confirming' });

          const confirmResponse = await confirmUpload(attachmentId);

          if (confirmResponse.status === 'ERROR') {
            updateFileStatus(uploadFile.id, {
              status: 'error',
              error: confirmResponse.message,
            });
            continue;
          }

          // Success
          updateFileStatus(uploadFile.id, {
            status: 'success',
            progress: 100,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          updateFileStatus(uploadFile.id, {
            status: 'error',
            error: errorMessage,
          });
        } finally {
          xhrMap.delete(uploadFile.id);
        }
      }

      setIsUploading(false);
    },
    [ticketId, updateFileStatus],
  );

  const retryFile = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      try {
        // Reset file state
        updateFileStatus(fileId, {
          status: 'idle',
          error: undefined,
          progress: 0,
        });

        setIsUploading(true);

        // Request new presigned URL
        updateFileStatus(fileId, { status: 'requesting-url' });

        const urlResponse = await generateUploadUrl(ticketId, {
          name: file.file.name,
          size: file.file.size,
          type: file.file.type,
        });

        if (urlResponse.status === 'ERROR') {
          updateFileStatus(fileId, {
            status: 'error',
            error: urlResponse.message,
          });
          return;
        }

        const { url, headers, attachmentId } = urlResponse.data!;

        // Upload to S3
        updateFileStatus(fileId, {
          status: 'uploading',
          attachmentId,
          progress: 0,
        });

        await uploadFileToS3(fileId, file.file, url, headers);

        // Confirm upload
        updateFileStatus(fileId, { status: 'confirming' });

        const confirmResponse = await confirmUpload(attachmentId);

        if (confirmResponse.status === 'ERROR') {
          updateFileStatus(fileId, {
            status: 'error',
            error: confirmResponse.message,
          });
          return;
        }

        updateFileStatus(fileId, {
          status: 'success',
          progress: 100,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateFileStatus(fileId, {
          status: 'error',
          error: errorMessage,
        });
      } finally {
        xhrMap.delete(fileId);
        setIsUploading(false);
      }
    },
    [files, ticketId, updateFileStatus],
  );

  const cancelFile = useCallback(
    (fileId: string) => {
      const xhr = xhrMap.get(fileId);
      if (xhr && xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
      xhrMap.delete(fileId);
      updateFileStatus(fileId, { status: 'error', error: 'Upload cancelled' });
    },
    [updateFileStatus],
  );

  const clearAll = useCallback(() => {
    // Abort all pending uploads
    for (const xhr of xhrMap.values()) {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    }
    xhrMap.clear();
    setFiles([]);
  }, []);

  return {
    files,
    uploadFiles,
    retryFile,
    cancelFile,
    clearAll,
    isUploading,
  };
}
