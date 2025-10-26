<!-- ccba9f43-6cbc-46eb-90c6-3fcd2f2a4a4c b30ea46e-9e59-4a34-bc93-5e0f6007790b -->
# S3 Cleanup Strategy for Orphaned Files

## Overview

Implement a hybrid cleanup strategy that:

1. Triggers immediate S3 deletion events when organizations/tickets are deleted
2. Runs a scheduled job to catch any orphaned files (eventual consistency)
3. Uses basic error handling with logging

## Current State Analysis

- Individual attachment deletion already works via `eventAttachmentDeleted` in `src/features/attachment/events/event-attachment-deleted.ts`
- Organization deletion exists in `src/features/organisation/actions/delete-oraganisation.ts` but doesn't clean up S3 files
- Ticket deletion exists in `src/features/ticket/actions/delete-ticket.ts` but doesn't clean up S3 files
- S3 key structure: `{organisationId}/{ticketId}/{fileName}-{attachmentId}`
- Database has cascade deletes: Organisation → Ticket → Attachment

## Implementation Plan

### 1. Event-Driven Cleanup (Immediate)

#### Create Organization Deletion Event

**File**: `src/features/organisation/events/event-organisation-deleted.ts` (new)

- Create Inngest function that receives `organisationId`
- Query all attachments for tickets in the organization before deletion
- Use S3 `ListObjectsV2Command` to list all objects with prefix `{organisationId}/`
- Delete all S3 objects using `DeleteObjectsCommand` (batch delete up to 1000 objects)
- Log errors but don't throw (basic error handling)

#### Create Ticket Deletion Event

**File**: `src/features/ticket/events/event-ticket-deleted.ts` (new)

- Create Inngest function that receives `organisationId`, `ticketId`, and array of attachments
- Use S3 `ListObjectsV2Command` with prefix `{organisationId}/{ticketId}/`
- Delete all S3 objects for that ticket
- Log errors but don't throw

#### Update Type Definitions

**File**: `src/lib/inngest.ts`

- Add event types for `app/organisation.deleted` and `app/ticket.deleted`

#### Register Events

**File**: `src/app/api/inngest/route.ts`

- Import and register the new event functions

### 2. Trigger Events from Actions

#### Update Organization Deletion

**File**: `src/features/organisation/actions/delete-oraganisation.ts`

- Before deleting organization, query all attachments with their ticket info
- After successful deletion, send `app/organisation.deleted` event with organizationId and attachment data
- Use try-catch to ensure event sending doesn't break the deletion flow

#### Update Ticket Deletion

**File**: `src/features/ticket/actions/delete-ticket.ts`

- Before deleting ticket, query all attachments for that ticket
- After successful deletion, send `app/ticket.deleted` event with ticket info and attachments
- Use try-catch to ensure event sending doesn't break the deletion flow

### 3. Scheduled Cleanup Job (Eventual Consistency)

#### Create Orphan Cleanup Job

**File**: `src/features/attachment/events/event-cleanup-orphaned-files.ts` (new)

- Create Inngest cron function that runs daily (e.g., 2 AM)
- List all S3 objects in the bucket
- For each object, parse the key to extract `organisationId`, `ticketId`, `attachmentId`
- Check if attachment exists in database
- If not found, delete from S3
- Batch operations for efficiency (process in chunks of 100)
- Log summary: files checked, files deleted, errors encountered

#### Register Cron Job

**File**: `src/app/api/inngest/route.ts`

- Add the scheduled cleanup function to the functions array

### 4. Utility Functions

#### Create S3 Deletion Utilities

**File**: `src/features/attachment/utils/delete-s3-objects.ts` (new)

- `deleteS3ObjectsByPrefix(prefix: string)`: Delete all objects with a given prefix
- `deleteS3ObjectsByKeys(keys: string[])`: Delete specific objects by key
- Handle batch deletion (AWS limit: 1000 objects per request)
- Return success/failure counts for logging

#### Create Key Parsing Utility

**File**: `src/features/attachment/utils/parse-s3-key.ts` (new)

- Parse S3 key format: `{organisationId}/{ticketId}/{fileName}-{attachmentId}`
- Return structured object or null if invalid format
- Used by orphan cleanup job

## Key Design Decisions

1. **Event-driven first**: Immediate cleanup when deletion happens
2. **Scheduled backup**: Daily cron job catches any missed files
3. **Basic error handling**: Log errors, don't throw (prevents blocking deletions)
4. **Batch operations**: Use AWS batch delete APIs for efficiency
5. **Query before delete**: Get attachment data before DB cascade deletes it
6. **Non-blocking events**: Event sending failures won't prevent deletions

## Files to Create

- `src/features/organisation/events/event-organisation-deleted.ts`
- `src/features/ticket/events/event-ticket-deleted.ts`
- `src/features/attachment/events/event-cleanup-orphaned-files.ts`
- `src/features/attachment/utils/delete-s3-objects.ts`
- `src/features/attachment/utils/parse-s3-key.ts`

## Files to Modify

- `src/lib/inngest.ts` (add event types)
- `src/app/api/inngest/route.ts` (register new events)
- `src/features/organisation/actions/delete-oraganisation.ts` (trigger event)
- `src/features/ticket/actions/delete-ticket.ts` (trigger event)

### To-dos

- [ ] Create S3 deletion utility functions for batch operations
- [ ] Create S3 key parsing utility for orphan cleanup
- [ ] Create organization deletion event handler
- [ ] Create ticket deletion event handler
- [ ] Create scheduled orphan cleanup cron job
- [ ] Add new event types to Inngest configuration
- [ ] Register new event handlers in API route
- [ ] Update organization deletion action to trigger cleanup event
- [ ] Update ticket deletion action to trigger cleanup event