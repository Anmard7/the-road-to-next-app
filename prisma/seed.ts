import { hashPassword } from '@/features/password/utils/hash-and-verify';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

const users = [
  {
    username: 'admin',
    email: 'admin@admin.com',
    emailVerified: true,
  },
  {
    username: 'user',
    email: 'anmard@gmail.com',
    emailVerified: false,
  },
];

const tickets = [
  {
    title: 'Ticket 1',
    content: 'Ticket 1 description from database.',
    status: 'DONE' as const,
    deadline: new Date().toISOString().split('T')[0],
    bounty: 499, // $4.99
  },
  {
    title: 'Ticket 2',
    content: 'This is the second ticket from database.',
    status: 'OPEN' as const,
    deadline: new Date().toISOString().split('T')[0],
    bounty: 399, // $3.99
  },
  {
    title: 'Ticket 3',
    content: 'This is the third ticket from database.',
    status: 'IN_PROGRESS' as const,
    deadline: new Date().toISOString().split('T')[0],
    bounty: 599, // $5.99
  },
];
const comments = [
  {
    content: 'First comment on ticket 1 from database.',
  },
  {
    content: 'Second comment on ticket 1 from database.',
  },
  {
    content: 'Third comment on ticket 1 from database.',
  },
];

const seed = async () => {
  console.log('Seeding database...');
  const t0 = performance.now();

  const passwordHash = await hashPassword('password');

  // With onDelete: Cascade, deleting users will automatically delete their tickets
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();

  const dbUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });
  const dbTickets = await prisma.ticket.createManyAndReturn({
    data: tickets.map((ticket) => ({
      ...ticket,
      userId: dbUsers[0].id,
    })),
  });
  await prisma.comment.createMany({
    data: comments.map((comment) => ({
      ...comment,
      userId: dbUsers[1].id,
      ticketId: dbTickets[0].id,
    })),
  });
  const t1 = performance.now();
  console.log(`Seeded database in ${t1 - t0} milliseconds`);
};

seed();
