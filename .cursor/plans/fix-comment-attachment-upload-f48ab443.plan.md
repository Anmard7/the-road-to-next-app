<!-- f48ab443-342a-41f5-9682-5722052e4875 2a055de3-1cc3-4c72-a089-413ca571333b -->
# Fix Comment Attachment Upload Issues

## Problem Analysis

After implementing polymorphic relationships between attachments and both tickets and comments, comment attachments have two critical issues:

1. **No Automatic Refresh**: Newly uploaded comment attachments don't appear until manual page refresh - cache invalidation not triggered
2. **No Toast Feedback**: Users get no success/error feedback when uploading attachments

## Root Causes

### Issue 1: Missing Cache Invalidation

- `AttachmentCreateButton` has `onCreateAttachment` callback that should trigger cache invalidation
- The callback is only called when dialog closes via `handleSuccess()`
- The `onSuccess` prop is not being properly passed to or triggered by `useDirectUpload` hook
- Result: Cache never invalidates, new attachments don't appear without manual refresh

### Issue 2: Missing Toast Notifications

- `AttachmentCreateForm` wraps upload button in `Form` component with `EMPTY_ACTION_STATE`
- `useDirectUpload` hook manages upload state internally but doesn't return `ActionState`
- `useActionFeedback` hook never detects success/error (timestamp never changes)
- No toast appears despite successful uploads

## Solution

### 1. Add onSuccess Callback to useDirectUpload Hook

**File**: `src/features/attachment/hooks/use-direct-upload.ts`

Add callback parameter that fires ONLY when all files succeed:

- Add optional `onSuccess?: () => void` parameter to hook
- Call `onSuccess()` ONLY after ALL files successfully upload (check all have status 'success')
- Use a local flag inside `uploadFiles` to ensure callback fires once per batch (guard against re-renders/retries)
- Do NOT call `onSuccess` if any file fails or is cancelled

### 2. Add Clean Toast Notifications (No Duplicates)

**File**: `src/features/attachment/hooks/use-direct-upload.ts`

Show ONE summary toast per upload batch:

- Import `toast` from `sonner`
- After upload batch completes, check results and show ONE toast:
  - **All succeed**: `toast.success("Uploaded X file(s)")`
  - **Mixed results**: `toast.warning("X of Y uploaded; Z failed")`
  - **All fail**: `toast.error("Upload failed: [first error message]")`
- No per-file toasts to keep UX clean

### 3. Pass onSuccess Through Component Chain

**File**: `src/features/attachment/components/attachment-create-form.tsx`

Connect the callback chain:

- Pass `onSuccess` prop to `useDirectUpload` hook
- Remove the `Form` wrapper around dialog buttons (lines 151-158) - not needed since we're not using ActionState
- Keep direct button approach for both scenarios

### 4. Verify Cache Invalidation Works

**File**: `src/features/comment/components/comments/use-paginated-comments.ts`

Existing implementation should work once callback triggers:

- `onCreateAttachment` already calls `queryClient.invalidateQueries`
- This will refetch comments with new attachments
- Verify this creates smooth update (React Query should handle gracefully)

## Implementation Details

### Toast Logic (in useDirectUpload after batch completes)

```typescript
const successCount = files.filter(f => f.status === 'success').length;
const failCount = files.filter(f => f.status === 'error').length;
const totalCount = files.length;

if (successCount === totalCount) {
  toast.success(`Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
  onSuccess?.(); // Only trigger on full success
} else if (successCount > 0) {
  toast.warning(`${successCount} of ${totalCount} uploaded; ${failCount} failed`);
  // Dialog stays open, no onSuccess callback
} else {
  const firstError = files.find(f => f.error)?.error || 'Unknown error';
  toast.error(`Upload failed: ${firstError}`);
  // Dialog stays open, no onSuccess callback
}
```

### onSuccess Guard (prevent double-firing)

```typescript
let hasCalledSuccess = false;

const uploadFiles = useCallback(async (filesToUpload: File[]) => {
  hasCalledSuccess = false; // Reset flag at start of new batch
  // ... upload logic ...
  
  // At end, after checking all succeeded:
  if (allSucceeded && !hasCalledSuccess) {
    hasCalledSuccess = true;
    onSuccess?.();
  }
}, [onSuccess, ...]);
```

## Files to Modify

1. `src/features/attachment/hooks/use-direct-upload.ts` - Add onSuccess callback, toast notifications, guards
2. `src/features/attachment/components/attachment-create-form.tsx` - Pass onSuccess to hook, remove Form wrapper
3. `src/features/comment/components/comments/use-paginated-comments.ts` - Verify (likely no changes needed)

## Expected Behavior After Fix

### Success Flow (All Files Upload)

1. User selects and uploads attachment(s)
2. Upload progress shows in form
3. When complete: ONE success toast appears "Uploaded X file(s)"
4. `onSuccess` callback fires ONCE
5. Dialog closes automatically
6. Cache invalidates via `onCreateAttachment()`
7. Comments refetch, new attachment appears immediately

### Partial Success Flow

1. Some files upload, others fail
2. ONE warning toast: "X of Y uploaded; Z failed"
3. NO `onSuccess` callback fired
4. Dialog stays open for user to retry/cancel

### All Fail Flow

1. All files fail to upload
2. ONE error toast with first error message
3. NO `onSuccess` callback fired
4. Dialog stays open for retry

## Implementation Notes

- Maintain existing ticket attachment behavior (no regression)
- Ensure `onSuccess` only fires once per batch using local flag
- Only close dialog when ALL files succeed
- Keep error messages specific and helpful
- Test single file, multiple files, mixed success/failure scenarios
- Verify retry functionality works correctly

### To-dos

- [ ] Add toast notifications to useDirectUpload hook for success/error feedback
- [ ] Add onSuccess callback parameter to useDirectUpload hook
- [ ] Remove unnecessary Form wrapper from AttachmentCreateForm and pass onSuccess to useDirectUpload
- [ ] Test and verify React Query cache invalidation doesn't cause jarring refresh