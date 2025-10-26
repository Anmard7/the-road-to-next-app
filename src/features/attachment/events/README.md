# S3 Cleanup System

This directory contains the implementation for cleaning up orphaned S3 files when organizations or tickets are deleted.

## Overview

The system uses a hybrid approach:

1. **Event-driven cleanup**: Immediate deletion when organizations/tickets are deleted
2. **Scheduled cleanup**: Periodic scan for orphaned files (eventual consistency)

## Files

- `event-organisation-deleted.ts` - Handles organization deletion events
- `event-ticket-deleted.ts` - Handles ticket deletion events
- `event-attachment-deleted.ts` - Handles individual attachment deletion (existing)
- `event-cleanup-orphaned-files.ts` - Scheduled cleanup job for orphaned files
- `../utils/delete-s3-objects.ts` - S3 batch deletion utilities
- `../utils/parse-s3-key.ts` - S3 key parsing utilities

## Setup

### Event-Driven Cleanup

The system automatically triggers cleanup when:

- An organization is deleted → deletes all S3 files for that organization
- A ticket is deleted → deletes all S3 files for that ticket
- An attachment is deleted → deletes the specific S3 file

### Scheduled Cleanup

To run the orphaned files cleanup as a cron job, you need to set it up separately. You can trigger it manually or set up a cron job to call:

```bash
# Manual trigger
npx inngest-cli run app/cleanup.orphaned-files

# Or via API
curl -X POST https://your-domain.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "app/cleanup.orphaned-files", "data": {}}'
```

For production, set up a cron job that runs daily at 2 AM:

```bash
# Add to crontab
0 2 * * * curl -X POST https://your-domain.com/api/inngest -H "Content-Type: application/json" -d '{"name": "app/cleanup.orphaned-files", "data": {}}'
```

## Error Handling

The system uses basic error handling:

- Logs errors but doesn't throw (prevents blocking deletions)
- Failed deletions are logged with specific error messages
- Scheduled cleanup provides summary statistics

## S3 Key Format

Files are stored with the format: `{organisationId}/{ticketId}/{fileName}-{attachmentId}`

Example: `org_123/ticket_456/document.pdf-att_789`

## Monitoring

Check the logs for cleanup results:

- Organization cleanup: "Starting S3 cleanup for organization: {id}"
- Ticket cleanup: "Starting S3 cleanup for ticket: {id}"
- Orphan cleanup: "Starting orphaned files cleanup job"

Each cleanup operation logs:

- Number of files processed
- Number of successful deletions
- Number of failed deletions
- Error messages (if any)
