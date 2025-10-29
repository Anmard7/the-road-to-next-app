<!-- 0c90db8a-6193-478a-ab80-4fa027fc8bfe 543cd9f8-c00a-4ac6-9b15-a5ea029eb02c -->
# Enforce Single Foreign Key on Attachments

## Overview

Enforce at runtime that each Attachment belongs to exactly one entity (ticket OR comment, never both) using the existing `AttachmentSubjectSchema` discriminated union and type-safe validation in `generateUploadUrl`.

## Current State Analysis

The codebase has:

- `AttachmentSubjectSchema` (discriminated union) already defined in `src/features/attachment/types.ts:40-51` that models the constraint
- `generateUploadUrl` in `src/features/attachment/actions/generate-upload-url.ts` creates attachments using conditional spreads (lines 81-82)
- The Prisma schema allows both `ticketId` and `commentId` to be optional (lines 149-152 in `schema.prisma`)

## Implementation Plan

### 1. Extend AttachmentSubjectSchema for Database Input Validation

**File: `src/features/attachment/types.ts`**

- Add a new schema `AttachmentCreateDataSchema` that validates the Prisma `attachment.create` data payload
- This schema should:
  - Accept `entity: AttachmentEntity` as a discriminator
  - When `entity === 'TICKET'`: require `ticketId: string`, forbid `commentId` (must be `undefined` or omitted)
  - When `entity === 'COMMENT'`: require `commentId: string`, forbid `ticketId` (must be `undefined` or omitted)
  - Include other required fields: `name`, `status`, `contentType`, `size`
  - Use `.strict()` to prevent extra fields

Example structure:

```typescript
export const AttachmentCreateDataSchema = z.discriminatedUnion('entity', [
  z.object({
    entity: z.literal(AttachmentEntity.TICKET),
    ticketId: z.string().cuid(),
    commentId: z.undefined().optional(),
    name: z.string().min(1),
    status: z.literal(AttachmentStatus.PENDING),
    contentType: z.string(),
    size: z.number().positive(),
  }).strict(),
  z.object({
    entity: z.literal(AttachmentEntity.COMMENT),
    commentId: z.string().cuid(),
    ticketId: z.undefined().optional(),
    name: z.string().min(1),
    status: z.literal(AttachmentStatus.PENDING),
    contentType: z.string(),
    size: z.number().positive(),
  }).strict()
]);

export type AttachmentCreateData = z.infer<typeof AttachmentCreateDataSchema>;
```

### 2. Create Type-Safe Attachment Data Builder

**File: `src/features/attachment/utils/build-attachment-data.ts` (new file)**

- Create a builder function `buildAttachmentCreateData` that:
  - Takes parameters: `entityId: string`, `entity: AttachmentEntity`, `fileMetadata: { name, size, contentType }`
  - Returns properly typed data matching `AttachmentCreateDataSchema`
  - Uses discriminated union logic to ensure only one foreign key is set
  - Validates the output with `AttachmentCreateDataSchema.parse()`

Example signature:

```typescript
export function buildAttachmentCreateData(
  entityId: string,
  entity: AttachmentEntity,
  fileMetadata: { name: string; size: number; contentType: string }
): AttachmentCreateData {
  const baseData = {
    name: fileMetadata.name,
    status: AttachmentStatus.PENDING as const,
    contentType: fileMetadata.contentType,
    size: fileMetadata.size,
    entity,
  };

  const attachmentData: AttachmentCreateData =
    entity === AttachmentEntity.TICKET
      ? { ...baseData, ticketId: entityId, commentId: undefined }
      : { ...baseData, commentId: entityId, ticketId: undefined };

  return AttachmentCreateDataSchema.parse(attachmentData);
}
```

### 3. Refactor generateUploadUrl to Use Validation

**File: `src/features/attachment/actions/generate-upload-url.ts`**

- Import `buildAttachmentCreateData` from the new utils file
- Import `AttachmentStatus` from `@/generated/prisma`
- Replace lines 78-88 (the `prisma.attachment.create` call) with:
```typescript
const attachmentData = buildAttachmentCreateData(entityId, entity, {
  name,
  size,
  contentType: type,
});

const attachment = await prisma.attachment.create({
  data: attachmentData,
});
```


This ensures:

- The discriminated union validation runs before database insertion
- TypeScript enforces that only one foreign key is set
- Runtime validation via Zod catches any edge cases
- Clear error messages if validation fails

### 4. Add Runtime Guard in confirmUpload (Defense in Depth)

**File: `src/features/attachment/actions/confirm-upload.ts`**

- After fetching the attachment (line 26-29), add a validation check:
```typescript
// Validate exactly one foreign key is set
const hasTicket = !!attachment.ticketId;
const hasComment = !!attachment.commentId;

if (hasTicket === hasComment) {
  // Both true or both false
  return toActionState(
    'ERROR',
    'Invalid attachment: must belong to exactly one entity'
  );
}

// Ensure entity matches the foreign key
if (attachment.entity === 'TICKET' && !hasTicket) {
  return toActionState('ERROR', 'Invalid attachment: entity mismatch');
}
if (attachment.entity === 'COMMENT' && !hasComment) {
  return toActionState('ERROR', 'Invalid attachment: entity mismatch');
}
```


This adds defense-in-depth validation at the confirmation stage.

### 5. Update Type Exports

**File: `src/features/attachment/types.ts`**

- Export the new schema and types:
  - `AttachmentCreateDataSchema`
  - `AttachmentCreateData`

These can be reused across the application for consistency.

## Key Benefits

1. **Type Safety**: TypeScript enforces the constraint at compile time via discriminated unions
2. **Runtime Validation**: Zod validates before database insertion, catching edge cases
3. **Clear Error Messages**: Validation errors are specific and actionable
4. **Centralized Logic**: Single source of truth in `buildAttachmentCreateData`
5. **Defense in Depth**: Additional validation in `confirmUpload` catches corrupted data
6. **Maintainability**: Future developers cannot accidentally violate the constraint
7. **Leverages Existing Code**: Extends the already-defined `AttachmentSubjectSchema`

## Files to Modify

1. `src/features/attachment/types.ts` - Add `AttachmentCreateDataSchema`
2. `src/features/attachment/utils/build-attachment-data.ts` - New builder function
3. `src/features/attachment/actions/generate-upload-url.ts` - Use validated builder
4. `src/features/attachment/actions/confirm-upload.ts` - Add runtime guard

## Testing Considerations

After implementation, verify:

- Attachments for tickets only set `ticketId`
- Attachments for comments only set `commentId`
- Attempting to create attachment with both IDs fails with clear error
- Attempting to create attachment with neither ID fails with clear error
- Type errors if code tries to violate the constraint

### To-dos

- [ ] Add AttachmentCreateDataSchema discriminated union to types.ts with strict validation for ticket/comment foreign keys
- [ ] Create build-attachment-data.ts with buildAttachmentCreateData function that returns validated AttachmentCreateData
- [ ] Refactor generateUploadUrl to use buildAttachmentCreateData instead of conditional spreads
- [ ] Add runtime validation guard in confirmUpload to verify exactly one foreign key is set