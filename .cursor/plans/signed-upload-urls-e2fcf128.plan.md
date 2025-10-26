<!-- e2fcf128-00c0-46f6-a6f2-8ac7fccd5d61 bcf90a89-0533-4597-a6c9-7b8a9bba7c5e -->
# Implement Signed Upload URLs for Direct S3 Uploads

## Current vs. New Architecture

**Current Flow:** Client → Server (receives full file) → S3
**New Flow:** Client → Server (request URL) → Client uploads directly to S3 → Server (confirmation)

## Implementation Steps

### 1. Create Presigned URL Generation Server Action

**File:** `src/features/attachment/actions/generate-upload-url.ts`

Create a new server action that:

- Validates user permissions (same checks as current `createAttachments`)
- Accepts file metadata (name, size, type) without the actual file
- Validates file metadata against `ACCEPTED` types and `MAX_SIZE`
- Generates a unique S3 key using existing `generateS3Key` utility
- Creates a "pending" attachment record in the database
- Uses `getSignedUrl` from `@aws-sdk/s3-request-presigner` with `PutObjectCommand`
- Returns: `{ uploadUrl, attachmentId, key }` with 60-second expiration

### 2. Create Upload Confirmation Server Action

**File:** `src/features/attachment/actions/confirm-upload.ts`

Create a new server action that:

- Receives `attachmentId` from the client
- Verifies the file exists in S3 using `HeadObjectCommand`
- Updates the attachment status from "pending" to "confirmed" in the database
- Includes error handling for failed/expired uploads

### 3. Update Database Schema

**File:** `prisma/schema.prisma`

Add a `status` field to the `Attachment` model:

- `status` enum: `PENDING | CONFIRMED`
- Default to `PENDING`
- This allows tracking of incomplete uploads

### 4. Update Client Upload Component

**File:** `src/features/attachment/components/attachment-create-form.tsx`

Transform the form to:

1. When files are selected, immediately request presigned URLs (one per file)
2. Upload each file directly to S3 using `fetch()` PUT request
3. Show upload progress for each file (using `XMLHttpRequest` or upload progress API)
4. After each successful S3 upload, call confirmation action
5. Handle failures gracefully (show which files failed, allow retry)

### 5. Create Custom Hook for Direct Upload

**File:** `src/features/attachment/hooks/use-direct-upload.ts`

Encapsulate the upload logic:

- Request presigned URL
- Upload to S3 with progress tracking
- Confirm upload with server
- Return upload state (loading, progress, error, success)

### 6. Add AWS SDK Configuration Helper

**File:** `src/lib/aws.ts`

Export a `getPresignedUrl` helper function that wraps the AWS SDK's presigning logic with proper typing and error handling.

### 7. Update Cleanup Logic

**Files:** `src/features/attachment/events/event-cleanup-orphaned-files.ts`

Modify the cleanup job to:

- Delete "pending" attachments older than 1 hour (expired uploads)
- Delete their associated S3 objects

### 8. Add Environment Variable Documentation

Update `enviroment.d.ts` if needed (already has AWS vars, should be sufficient).

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

## Edge Cases Handled

- User closes browser mid-upload → Cleanup job removes pending records
- Upload fails → Client can retry with new presigned URL
- URL expires → Show clear error, allow requesting new URL
- Race condition → Confirmation verifies S3 object exists before confirming

### To-dos

- [ ] Create server action to generate presigned upload URLs with permission checks and metadata validation
- [ ] Create server action to confirm successful uploads by verifying S3 object existence
- [ ] Add status field (PENDING/CONFIRMED) to Attachment model in Prisma schema
- [ ] Create custom hook to handle direct S3 upload with progress tracking
- [ ] Refactor AttachmentCreateForm to use presigned URLs and direct uploads
- [ ] Modify cleanup event to remove expired pending attachments
- [ ] Test complete upload flow including error cases and cleanup