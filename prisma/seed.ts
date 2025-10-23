import { hashPassword } from '@/features/password/utils/hash-and-verify';
import { PrismaClient } from '@/generated/prisma';

/**
 * This script is used to seed the database with initial data.
 * It creates users, tickets, comments, organisations, and memberships.
 * The script first clears the existing data in the database and then inserts the new data.
 * It is useful for development and testing purposes to ensure a consistent database state.
 */

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define sample user data
const users = [
  {
    username: 'admin',
    email: 'admin@admin.com',
    emailVerified: true,
  },
  {
    username: 'user',
    email: 'anmard@gmail.com',
    emailVerified: true,
  },
];

// Define sample ticket data
const tickets = [
  {
    title: 'Ticket 1',
    content: 'Ticket 1 description from database.',
    status: 'DONE' as const,
    deadline: new Date().toISOString().split('T')[0],
    bounty: 499, // Represents $4.99
  },
  {
    title: 'Ticket 2',
    content: 'This is the second ticket from database.',
    status: 'OPEN' as const,
    deadline: new Date().toISOString().split('T')[0],
    bounty: 399, // Represents $3.99
  },
  {
    title: 'Ticket 3',
    content: 'This is the third ticket from database.',
    status: 'IN_PROGRESS' as const,
    deadline: new Date().toISOString().split('T')[0],
    bounty: 599, // Represents $5.99
  },
];

// Define sample comment data
const comments = [
  {
    content: 'First comment on ticket 1 from database (Org 1).',
  },
  {
    content: 'Second comment on ticket 1 from database (Org 1).',
  },
  {
    content: 'Third comment on ticket 1 from database (Org 1).',
  },
];

// Main seeding function
const seed = async () => {
  console.log('Seeding database...');
  const t0 = performance.now();

  // Hash a default password for the users
  const passwordHash = await hashPassword('password');

  // Clear existing data from the database
  // The order of deletion is important to avoid foreign key constraint violations
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.membership.deleteMany();

  // Create a sample organisation
  const dbOrganisations = await prisma.organisation.create({
    data: {
      name: 'Organisation 1',
    },
  });

  // Create sample users with the hashed password
  const dbUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  // Create sample memberships to link users to the organisation
  await prisma.membership.createMany({
    data: [
      {
        userId: dbUsers[0].id, // Admin user
        organisationId: dbOrganisations.id,
        isActive: true,
        membershipRole: 'ADMIN',
      },
      {
        userId: dbUsers[1].id, // Regular user
        organisationId: dbOrganisations.id,
        isActive: false,
        membershipRole: 'MEMBER',
      },
    ],
  });

  // Create sample tickets, assigning them to the admin user and the organisation
  const dbTickets = await prisma.ticket.createManyAndReturn({
    data: tickets.map((ticket) => ({
      ...ticket,
      userId: dbUsers[0].id,
      organisationId: dbOrganisations.id,
    })),
  });

  // Create sample comments, assigning them to the regular user and the first ticket
  await prisma.comment.createMany({
    data: comments.map((comment) => ({
      ...comment,
      userId: dbUsers[1].id,
      ticketId: dbTickets[0].id,
    })),
  });

  // Log the time taken to seed the database
  const t1 = performance.now();
  console.log(`Seeded database in ${t1 - t0} milliseconds`);
};

// Execute the seeding function
seed();
