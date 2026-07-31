import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Invalidate cached dev instance if schema was updated during dev session
if (globalForPrisma.prisma && !("expense" in globalForPrisma.prisma)) {
  if (globalForPrisma.pool) {
    globalForPrisma.pool.end(); // close old pool cleanly
  }
  globalForPrisma.prisma = undefined;
  globalForPrisma.pool = undefined;
}

export let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ connectionString })
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(globalForPrisma.pool)
    globalForPrisma.prisma = new PrismaClient({ adapter })
  }
  prisma = globalForPrisma.prisma
}
