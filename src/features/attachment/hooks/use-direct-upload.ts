'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AttachmentEntity } from '@/generated/prisma';
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

interface UseDirectUploadOptions {
  onSuccess?: () => void;
}

interface UseDirectUploadReturn {
  files: UploadFile[];
  uploadFiles: (filesToUpload: File[]) => Promise<void>;
  retryFile: (fileId: string) => Promise<void>;
  cancelFile: (fileId: string) => void;
  clearAll: () => void;
  isUploading: boolean;
}

type UploadOutcome = {
  status: UploadStatus;
  error?: string;
};

export function useDirectUpload(
  entityId: string,
  entity: AttachmentEntity,
  options: UseDirectUploadOptions = {},
): UseDirectUploadReturn {
  const { onSuccess } = options;
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map());

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

  const uploadFileToS3 = useCallback(
    (
      fileId: string,
      file: File,
      presignedUrl: string,
      headers: Record<string, string>,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrMapRef.current.set(fileId, xhr);

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
    },
    [updateFileStatus],
  );

  const handleBatchComplete = useCallback(
    (results: UploadOutcome[]): boolean => {
      if (results.length === 0) {
        return false;
      }

      const successCount = results.filter(
        (result) => result.status === 'success',
      ).length;
      const errorCount = results.filter(
        (result) => result.status === 'error',
      ).length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        toast.success(
          `Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`,
        );
        return true;
      }

      if (successCount > 0) {
        toast.warning(
          `${successCount} of ${totalCount} uploaded; ${errorCount} failed`,
        );
      } else {
        const firstError =
          results.find((result) => result.status === 'error' && result.error)
            ?.error ?? 'Unknown error';
        toast.error(`Upload failed: ${firstError}`);
      }

      return false;
    },
    [],
  );

  const runUpload = useCallback(
    async (fileId: string, file: File): Promise<UploadOutcome> => {
      let finalStatus: UploadStatus = 'success';
      let errorMessage: string | undefined;

      try {
        updateFileStatus(fileId, {
          status: 'requesting-url',
          error: undefined,
          progress: 0,
        });

        const urlResponse = await generateUploadUrl(entityId, entity, {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        if (urlResponse.status === 'ERROR') {
          throw new Error(urlResponse.message);
        }

        const { url, headers, attachmentId } = urlResponse.data!;

        updateFileStatus(fileId, {
          status: 'uploading',
          attachmentId,
          progress: 0,
        });

        await uploadFileToS3(fileId, file, url, headers);

        updateFileStatus(fileId, { status: 'confirming' });

        const confirmResponse = await confirmUpload(attachmentId);

        if (confirmResponse.status === 'ERROR') {
          throw new Error(confirmResponse.message);
        }

        updateFileStatus(fileId, {
          status: 'success',
          progress: 100,
        });
      } catch (error) {
        finalStatus = 'error';
        errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateFileStatus(fileId, {
          status: 'error',
          error: errorMessage,
        });
      } finally {
        xhrMapRef.current.delete(fileId);
      }

      return {
        status: finalStatus,
        error: errorMessage,
      };
    },
    [entityId, entity, updateFileStatus, uploadFileToS3],
  );

  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      if (filesToUpload.length === 0) return;

      setIsUploading(true);
      let hasCalledSuccess = false;

      try {
        const initialFiles = filesToUpload.map((file) => ({
          id: generateFileId(file),
          file,
          name: file.name,
          progress: 0,
          status: 'idle' as UploadStatus,
        }));

        setFiles((prev) => [...prev, ...initialFiles]);

        const batchResults: UploadOutcome[] = [];

        for (const uploadFile of initialFiles) {
          const result = await runUpload(uploadFile.id, uploadFile.file);
          batchResults.push(result);
        }

        const allSucceeded = handleBatchComplete(batchResults);

        if (allSucceeded && !hasCalledSuccess) {
          hasCalledSuccess = true;
          onSuccess?.();
        }
      } finally {
        setIsUploading(false);
      }
    },
    [handleBatchComplete, onSuccess, runUpload],
  );

  const retryFile = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      setIsUploading(true);

      try {
        const result = await runUpload(fileId, file.file);
        const succeeded = handleBatchComplete([result]);

        if (succeeded) {
          onSuccess?.();
        }
      } finally {
        setIsUploading(false);
      }
    },
    [files, handleBatchComplete, onSuccess, runUpload],
  );

  const cancelFile = useCallback(
    (fileId: string) => {
      const xhr = xhrMapRef.current.get(fileId);
      if (xhr && xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
      xhrMapRef.current.delete(fileId);
      updateFileStatus(fileId, { status: 'error', error: 'Upload cancelled' });
    },
    [updateFileStatus],
  );

  const clearAll = useCallback(() => {
    // Abort all pending uploads
    for (const xhr of xhrMapRef.current.values()) {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    }
    xhrMapRef.current.clear();
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
