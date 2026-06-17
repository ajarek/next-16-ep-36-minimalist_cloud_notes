import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import { neonConfig } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const url = process.env.DATABASE_URL

console.log('DATABASE_URL defined:', !!url)
if (url) {
  console.log('DATABASE_URL length:', url.length)
  console.log('DATABASE_URL start:', url.substring(0, 20))
  console.log('DATABASE_URL end:', url.substring(url.length - 20))
}

if (!url) {
  throw new Error('DATABASE_URL is missing in environment variables.')
}

neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
  const adapter = new PrismaNeon({ connectionString: url.trim() })
  return new PrismaClient({ adapter } as any)
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
