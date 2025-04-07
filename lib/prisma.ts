import { PrismaClient } from '@prisma/client'

// PrismaClient är bundet till NodeJS-miljön
// NextJS hot-reload kan skapa flera instanser av PrismaClient i utvecklingsläge
// För att undvika detta, deklarerar vi en global variabel för PrismaClient instansen

// Läs mer: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 