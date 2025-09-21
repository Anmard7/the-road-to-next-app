import { hashPassword } from '@/features/password/utils/hash-and-verify';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

const users = [
  {
    username: 'admin',
    email: 'admin@admin.com',
  },
  {
    username: 'user',
    email: 'anmard@gmail.com',
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

const seed = async () => {
  console.log('Seeding database...');
  const t0 = performance.now();

  const passwordHash = await hashPassword('password');

  // With onDelete: Cascade, deleting users will automatically delete their tickets
  await prisma.user.deleteMany();

  const dbUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });
  await prisma.ticket.createMany({
    data: tickets.map((ticket) => ({
      ...ticket,
      userId: dbUsers[0].id,
    })),
  });

  const t1 = performance.now();
  console.log(`Seeded database in ${t1 - t0} milliseconds`);
};

seed();
