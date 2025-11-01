/**
 * This file demonstrates a highly type-safe approach for a database creation function using TypeScript and Prisma.
 *
 * How Type Safety is Achieved:
 * 1.  **Prisma-Generated Types**: It uses `Comment` and `Prisma.CommentGetPayload` from the auto-generated Prisma client. These types perfectly match the database schema.
 * 2.  **Strict Argument Typing**: The `CreateCommentArgs` type ensures that the function is always called with the correct parameters (`userId`, `ticketId`, `content`).
 * 3.  **Conditional Generic Return Type**: The core of the type safety is the `CommentPayload<T>` type. It's a TypeScript conditional generic type. It inspects the `options` argument passed to `createComment` and dynamically determines the exact shape of the returned object.
 *     - If `includeUser: true` is passed, the return type will include the `user` object.
 *     - If `includeTicket: true` is passed, the return type will include the `ticket` object.
 *     - If both are passed, the return type includes both.
 *     - If neither is passed, it returns the base `Comment` type.
 * 4.  **Type Assertion**: A final type assertion `as CommentPayload<T>` is used to tell TypeScript that the dynamically constructed Prisma query will indeed return an object matching the complex conditional type. This bridges the gap between the dynamic runtime logic and static type analysis.
 *
 * This pattern makes the `createComment` function both flexible and robust, preventing runtime errors by catching
 * incorrect data access at compile time.
 */
import { Comment, Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

// Define specific include shapes for Prisma queries.
// This helps in creating reusable and type-safe include objects.
type UserInclude = { user: { select: { username: true } } };
type TicketInclude = { ticket: true };
type UserAndTicketInclude = UserInclude & TicketInclude;

// Type for the arguments required to create a comment.
// This ensures that any call to createComment provides the necessary data.
type CreateCommentArgs = {
  userId: string;
  ticketId: string;
  content: string;
};

// Defines the optional `include` options for the function.
// Callers can specify whether to include the related 'user' or 'ticket' in the response.
type IncludeOptions = {
  includeUser?: boolean;
  includeTicket?: boolean;
};

// This is a conditional generic type. It's the key to the dynamic return type of `createComment`.
// It takes a generic type `T` which is constrained to the `IncludeOptions` shape.
// Based on the properties of `T`, it determines the precise shape of the returned comment object.
type CommentPayload<T extends IncludeOptions> = T extends {
  includeUser: true;
  includeTicket: true;
}
  ? Prisma.CommentGetPayload<{ include: UserAndTicketInclude }> // If both user and ticket are included
  : T extends { includeUser: true }
    ? Prisma.CommentGetPayload<{ include: UserInclude }> // If only user is included
    : T extends { includeTicket: true }
      ? Prisma.CommentGetPayload<{ include: TicketInclude }> // If only ticket is included
      : Comment; // Otherwise, return the base Comment type

export async function createComment<T extends IncludeOptions>({
  userId,
  ticketId,
  content,
  options,
}: CreateCommentArgs & { options?: T }): Promise<CommentPayload<T>> {
  // Dynamically construct the `include` object for the Prisma query based on the provided options.

  const includeUser = options?.includeUser && {
    user: {
      select: {
        username: true,
      },
    },
  };

  const includeTicket = options?.includeTicket && {
    ticket: true,
  };

  const comment = await prisma.comment.create({
    data: {
      userId,
      ticketId,
      content,
    },
    include: {
      ...includeUser,
      ...includeTicket,
    },
  });

  // The `comment` variable here has a type that is inferred by Prisma based on the `include` object.
  // However, TypeScript can't statically connect the dynamic `include` object to our conditional `CommentPayload<T>` type.
  // So, we use a type assertion to tell TypeScript that we know the returned object's shape
  // will match the one defined by `CommentPayload<T>`. This is the bridge between runtime logic and static types.
  return comment as CommentPayload<T>;
}
