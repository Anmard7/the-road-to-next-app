<!-- e2fcf128-00c0-46f6-a6f2-8ac7fccd5d61 bcf90a89-0533-4597-a6c9-7b8a9bba7c5e -->
# Implement Signed Upload URLs for Direct S3 Uploads

## Current vs. New Architecture

**Current Flow:** Client → Server (receives full file) → S3
**New Flow:** Client → Server (request URL) → Client uploads directly to S3 → Server (confirmation)

## Implementation Steps

### 1. Update Database Schema ✅

**File:** `prisma/schema.prisma` (line 139, Attachment model)

Add to the Attachment model:

- Create enum `AttachmentStatus { PENDING, CONFIRMED }`
- Add `status AttachmentStatus @default(PENDING)` field
- Add `etag String?` field to store S3 ETag for verification
- Add `contentType String?` field to store MIME type
- Add `size Int?` field to store file size in bytes

After schema changes:

- Run `prisma generate` to regenerate client
- Run `prisma migrate dev` to create and apply migration

### 2. Create Presigned URL Generation Server Action ✅

**File:** `src/features/attachment/actions/generate-upload-url.ts`

Implementation details:

- Accept `ticketId` and file metadata: `{ name: string, size: number, type: string }`
- Validate user authentication via `getAuthOrRedirect()`
- Fetch ticket and verify user is owner (same checks as `createAttachments`)
- Validate file metadata:
- Check `type` is in `ACCEPTED` array
- Check `sizeInMB(size) <= MAX_SIZE`
- Create attachment record with `status: 'PENDING'`, store `name`, `contentType`, `size`
- Generate S3 key using `generateS3Key({ organisationId, ticketId, fileName, attachmentId })`
- Use `getPresignedPutUrl()` helper with:
- `Key`: generated key
- `ContentType`: file type
- `ServerSideEncryption`: 'AES256' (optional but recommended)
- Expiration: 60 seconds
- Return: `{ url: string, headers: Record<string, string>, key: string, attachmentId: string }`

### 3. Create Upload Confirmation Server Action ✅

**File:** `src/features/attachment/actions/confirm-upload.ts`

Implementation details:

- Accept `attachmentId: string`
- Validate user authentication
- Fetch attachment with ticket relation
- Verify user is ticket owner (authorization check)
- Use `HeadObjectCommand` to verify S3 object exists
- Validate S3 metadata matches attachment record:
- Check `ContentLength` matches stored size
- Check `ContentType` matches stored contentType
- Update attachment: set `status: 'CONFIRMED'`, store `etag` from S3 response
- Return success/error state
- Handle errors: file not found, metadata mismatch, unauthorized

### 4. Add AWS SDK Helper ✅

**File:** `src/lib/aws.ts`

Add `getPresignedPutUrl` function:

- Import `getSignedUrl` from `@aws-sdk/s3-request-presigner`
- Import `PutObjectCommand` from `@aws-sdk/client-s3`
- Accept typed parameters: `{ key: string, contentType: string, expiresIn?: number }`
- Create `PutObjectCommand` with:
- `Bucket: process.env.AWS_BUCKET_NAME`
- `Key: key`
- `ContentType: contentType`
- `ServerSideEncryption: 'AES256'`
- Generate presigned URL with `expiresIn` (default 60 seconds)
- Return `{ url: string, headers: Record<string, string> }`
- Include proper TypeScript typing and error handling

### 5. Create Custom Hook for Direct Upload ✅

**File:** `src/features/attachment/hooks/use-direct-upload.ts`

Hook signature: `useDirectUpload(ticketId: string)`

State management:

- Track per-file state: `{ id, name, progress, status, error, attachmentId }`
- Status enum: `'idle' | 'requesting-url' | 'uploading' | 'confirming' | 'success' | 'error'`

Functions to expose:

- `uploadFiles(files: File[])`: Main upload orchestrator
- For each file:

1. Set status to 'requesting-url'
2. Call `generateUploadUrl` action with file metadata
3. Set status to 'uploading'
4. PUT file to S3 using `XMLHttpRequest` for progress tracking
5. Set status to 'confirming'
6. Call `confirmUpload` action with attachmentId
7. Set status to 'success' or 'error'

- `retryFile(fileId: string)`: Retry failed upload
- `cancelFile(fileId: string)`: Cancel in-progress upload
- `clearAll()`: Reset state

Return: `{ files, uploadFiles, retryFile, cancelFile, clearAll, isUploading }`

### 6. Refactor Client Upload Component ✅

**File:** `src/features/attachment/components/attachment-create-form.tsx`

Major changes:

- Remove `useActionState` and server action form submission
- Use `useDirectUpload` hook instead
- Keep `useFilePreview` for initial file selection and validation
- When files are selected and validated:
- Call `uploadFiles()` from hook immediately
- Show progress bar for each file (0-100%)
- Display status icons: pending, uploading, success, error
- Show retry button for failed uploads
- Remove `<Form>` wrapper, use standard form or div
- Update UI to show:
- Per-file upload progress
- Overall upload status
- Individual file success/error states
- Retry functionality for failed files
- Call `revalidatePath` after all uploads complete (via server action or in confirm action)

### 7. Update Cleanup Job ✅

**File:** `src/features/attachment/events/event-cleanup-orphaned-files.ts`

Add second cleanup pass for pending attachments:

- Query attachments with `status: 'PENDING'` and `createdAt < (now - 1 hour)`
- For each pending attachment:
- Compute S3 key using `generateS3Key`
- Delete from S3 using `DeleteObjectCommand` (ignore errors if not found)
- Delete attachment record from database
- Log cleanup metrics: number of pending attachments cleaned
 - Run this pass before the existing orphaned file cleanup

### 8. File Name Safety ✅

**File:** `src/features/attachment/utils/generate-s3-key.ts`

- `generateS3Key` now sanitizes `fileName` (strip control chars and path separators, preserve/normalize extension, replace unsafe chars, limit base to 100 chars).

### 9. Query Adjustments ✅

**File:** `src/features/attachment/queries/get-attachments.ts`

- List only `status = 'CONFIRMED'` for user display; order by `createdAt desc`.

## Key Benefits

- **No server bottleneck:** Files never pass through Next.js server
- **Better scalability:** Server only handles metadata and permissions
- **Improved performance:** Direct S3 upload is faster
- **Cost efficient:** Reduced server bandwidth and processing
- **Progress tracking:** Native browser upload progress support

## Security Considerations

- Presigned URLs expire after 60 seconds
- Permission checks happen before URL generation
- S3 key includes organisationId, ticketId, and attachmentId for isolation
- Confirmation step verifies actual upload before marking as complete
- Failed uploads are cleaned up by background job

- S3 CORS: Required for browser PUT. Configure AllowedOrigins (dev/prod), AllowedMethods (PUT,GET,HEAD), AllowedHeaders (* or at least `Content-Type`, `x-amz-server-side-encryption`), ExposeHeaders (`ETag`).
- SSE-S3: Presigner sets `ServerSideEncryption: 'AES256'`; client sends `x-amz-server-side-encryption`.

## Edge Cases Handled

- User closes browser mid-upload → Cleanup job removes pending records
- Upload fails → Client can retry with new presigned URL
- URL expires → Show clear error, allow requesting new URL
- Race condition → Confirmation verifies S3 object exists before confirming

### To-dos

- [x] Create server action to generate presigned upload URLs with permission checks and metadata validation
- [x] Create server action to confirm successful uploads by verifying S3 object existence
- [x] Add status field (PENDING/CONFIRMED) and etag/contentType/size to Attachment model in Prisma schema
- [x] Create custom hook to handle direct S3 upload with progress tracking
- [x] Refactor AttachmentCreateForm to use presigned URLs and direct uploads
- [x] Modify cleanup event to remove expired pending attachments
- [x] Sanitize file names in `generateS3Key`
- [x] Filter `getAttachments` to only show CONFIRMED
- [ ] Configure S3 CORS (PUT/GET/HEAD, headers, expose ETag) for dev/prod origins
- [ ] Add/verify bucket policies: block public access, require TLS, require SSE-S3
- [ ] Harden NotFound handling in confirm (check `$metadata.httpStatusCode === 404`)
- [ ] Optionally require `status = CONFIRMED` (and ownership) before issuing download
- [ ] Decide fate of legacy server-side upload (`create-attachments.ts`): remove or keep as fallback
- [ ] Test complete upload flow including error cases and cleanup
