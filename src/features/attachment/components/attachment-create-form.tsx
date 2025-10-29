'use client';

import { AlertCircle, CheckCircle2, Loader2, RotateCcw, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttachmentEntity } from '@/generated/prisma';
import { ACCEPTED, MAX_SIZE } from '../constants';
import { useDirectUpload } from '../hooks/use-direct-upload';
import { useFilePreview } from '../hooks/use-file-preview';
import { AttachmentPreviewList } from './attachment-preview-list';

type AttachmentCreateFormButtonsProps = {
  onUpload: () => Promise<void>;
  disabled: boolean;
  isUploading: boolean;
  hasItems: boolean;
  itemCount: number;
  validationError: string | null;
};

type AttachmentCreateFormProps = {
  entityId: string;
  entity: AttachmentEntity;
  buttons?: (props: AttachmentCreateFormButtonsProps) => React.ReactNode;
  onSuccess?: () => void;
};

const AttachmentCreateForm = ({
  entityId,
  entity,
  buttons,
  onSuccess,
}: AttachmentCreateFormProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { items, validationError, validateAndSetFiles, removeItem, clearAll } =
    useFilePreview();

  const {
    files: uploadedFiles,
    uploadFiles,
    retryFile,
    cancelFile,
    clearAll: clearAllUploads,
    isUploading,
  } = useDirectUpload(entityId, entity as AttachmentEntity, { onSuccess });

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) {
      clearAll();
      return;
    }

    const filesArray = Array.from(fileList);
    const isValid = validateAndSetFiles(filesArray);

    if (!isValid && inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onRemoveItem = (id: string) => {
    const remainingFiles = removeItem(id);

    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      remainingFiles.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }
  };

  const onUploadClick = async () => {
    if (items.length === 0) return;

    // Convert preview items to File objects
    const filesToUpload = items.map((item) => item.file);
    await uploadFiles(filesToUpload);

    // Clear the form after upload starts
    clearAll();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className='h-5 w-5 text-green-600' />;
      case 'error':
        return <AlertCircle className='h-5 w-5 text-red-600' />;
      case 'requesting-url':
      case 'uploading':
      case 'confirming':
        return <Loader2 className='h-5 w-5 animate-spin text-blue-600' />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle':
        return 'Pending';
      case 'requesting-url':
        return 'Requesting URL...';
      case 'uploading':
        return 'Uploading...';
      case 'confirming':
        return 'Confirming...';
      case 'success':
        return 'Uploaded';
      case 'error':
        return 'Failed';
      default:
        return status;
    }
  };

  const hasItems = items.length > 0;
  const itemCount = items.length;
  const uploadDisabled = isUploading || !hasItems || !!validationError;
  const renderedButtons = buttons
    ? buttons({
        onUpload: onUploadClick,
        disabled: uploadDisabled,
        isUploading,
        hasItems,
        itemCount,
        validationError,
      })
    : null;
  const showDefaultUploadButton =
    !buttons && hasItems && uploadedFiles.length === 0;

  return (
    <div className='flex flex-col gap-y-4'>
      {/* File Selection Section */}
      <div className='flex flex-col gap-y-1'>
        <label htmlFor='files' className='text-sm font-medium'>
          Upload Files
          <span className='text-muted-foreground ml-1 text-xs font-normal'>
            (Max {MAX_SIZE}MB per file)
          </span>
        </label>
        <Input
          ref={inputRef}
          name='files'
          id='files'
          type='file'
          multiple
          accept={ACCEPTED.join(',')}
          onChange={onFilesChange}
          disabled={isUploading}
          aria-describedby={
            validationError ? 'file-validation-error' : undefined
          }
          aria-invalid={!!validationError}
        />
      </div>

      {validationError && (
        <p id='file-validation-error' className='text-destructive text-sm'>
          {validationError}
        </p>
      )}

      {/* Preview List */}
      <AttachmentPreviewList items={items} onRemove={onRemoveItem} />

      {/* Cancel and Upload Buttons */}
      {buttons ? (
        renderedButtons
      ) : (
        showDefaultUploadButton && (
          <Button
            onClick={() => void onUploadClick()}
            disabled={uploadDisabled}
            className='w-full'
          >
            Upload {itemCount} file{itemCount !== 1 ? 's' : ''}
          </Button>
        )
      )}

      {/* Upload Progress Section */}
      {uploadedFiles.length > 0 && (
        <div className='border-muted rounded-lg border bg-gray-50 p-4'>
          <h3 className='mb-3 text-sm font-semibold'>Upload Progress</h3>
          <div className='space-y-3'>
            {uploadedFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className='flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3'
              >
                {/* File header with status */}
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 flex-1 items-center gap-2'>
                    {getStatusIcon(uploadFile.status)}
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {uploadFile.name}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {getStatusText(uploadFile.status)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className='ml-2 flex gap-2'>
                    {uploadFile.status === 'error' && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => retryFile(uploadFile.id)}
                        className='h-8 w-8 p-0'
                        title='Retry upload'
                      >
                        <RotateCcw className='h-4 w-4' />
                      </Button>
                    )}
                    {(uploadFile.status === 'requesting-url' ||
                      uploadFile.status === 'uploading' ||
                      uploadFile.status === 'confirming') && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => cancelFile(uploadFile.id)}
                        className='h-8 w-8 p-0'
                        title='Cancel upload'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {(uploadFile.status === 'uploading' ||
                  (uploadFile.status === 'success' &&
                    uploadFile.progress === 100)) && (
                  <div className='h-2 flex-1 overflow-hidden rounded-full bg-gray-200'>
                    <div
                      className={`h-full transition-all duration-200 ${
                        uploadFile.status === 'success'
                          ? 'bg-green-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {uploadFile.status === 'error' && uploadFile.error && (
                  <p className='text-xs text-red-600'>{uploadFile.error}</p>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          {!isUploading && (
            <div className='mt-3 border-t border-gray-200 pt-3'>
              <div className='flex items-center justify-between text-sm'>
                <div className='space-y-1'>
                  <p>
                    <span className='font-medium'>
                      {
                        uploadedFiles.filter((f) => f.status === 'success')
                          .length
                      }
                    </span>
                    {' of '}
                    <span className='font-medium'>{uploadedFiles.length}</span>
                    {' uploaded'}
                  </p>
                  {uploadedFiles.some((f) => f.status === 'error') && (
                    <p className='text-red-600'>
                      {uploadedFiles.filter((f) => f.status === 'error').length}
                      {' failed'}
                    </p>
                  )}
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={clearAllUploads}
                  className='h-8'
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { AttachmentCreateForm };
