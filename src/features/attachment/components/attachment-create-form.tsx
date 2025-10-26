'use client';

import { useActionState, useRef } from 'react';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Input } from '@/components/ui/input';
import { createAttachments } from '../actions/create-attachments';
import { ACCEPTED, MAX_SIZE } from '../constants';
import { useFilePreview } from '../hooks/use-file-preview';
import { AttachmentPreviewList } from './attachment-preview-list';

type AttachmentCreateFormProps = {
  ticketId: string;
};

const AttachmentCreateForm = ({ ticketId }: AttachmentCreateFormProps) => {
  const [actionState, action] = useActionState(
    createAttachments.bind(null, ticketId),
    EMPTY_ACTION_STATE,
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { items, validationError, validateAndSetFiles, removeItem, clearAll } =
    useFilePreview();

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) {
      clearAll();
      return;
    }

    const filesArray = Array.from(fileList);
    const isValid = validateAndSetFiles(filesArray);

    // If validation fails, clear the file input
    if (!isValid && inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onRemoveItem = (id: string) => {
    const remainingFiles = removeItem(id);

    // Sync the file input after removing an item
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      remainingFiles.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }
  };

  const onFormSuccess = () => {
    clearAll();
    if (inputRef.current) {
      inputRef.current.value = '';
      // Ensure FileList is also cleared for consistency
      const dataTransfer = new DataTransfer();
      inputRef.current.files = dataTransfer.files;
    }
  };

  return (
    <Form action={action} actionState={actionState} onSuccess={onFormSuccess}>
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
      <FieldError actionState={actionState} name='files' />

      <AttachmentPreviewList items={items} onRemove={onRemoveItem} />

      <SubmitButton
        label='Upload'
        disabled={items.length === 0 || !!validationError}
      />
    </Form>
  );
};

export { AttachmentCreateForm };
