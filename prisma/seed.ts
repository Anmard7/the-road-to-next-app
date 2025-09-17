import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

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

  await prisma.ticket.deleteMany();
  await prisma.ticket.createMany({
    data: tickets,
  });

  const t1 = performance.now();
  console.log(`Seeded database in ${t1 - t0} milliseconds`);
};

seed();
