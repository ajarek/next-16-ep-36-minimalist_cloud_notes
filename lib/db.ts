import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const url = process.env.DATABASE_URL

if (!url) {
  throw new Error('DATABASE_URL is missing in environment variables.')
}

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaNeon(pool as any)
  return new PrismaClient({ adapter } as any)
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
