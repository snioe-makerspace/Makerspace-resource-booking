import { Pool } from '@prisma/pg-worker';
import { PrismaPg } from '@prisma/adapter-pg-worker';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
let db;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  db = new PrismaClient({ adapter });
} else {
  db = new PrismaClient();
}

export { db };

// const pool = new Pool({ connectionString });
// const adapter = new PrismaPg(pool);
// export const db = new PrismaClient({ adapter });
