import type { PrismaClient } from '@prisma/client'
export function seedDemoData(
  db: PrismaClient,
  opts?: { adminPassword?: string; adminEmail?: string; log?: (msg: string) => void },
): Promise<void>
