import { createRequire } from 'node:module'
import { defineConfig } from '@prisma/config'

const require = createRequire(import.meta.url)

try {
  require('dotenv/config')
} catch {
  // In some CI/install phases dotenv may not be resolvable yet.
  // Render provides DATABASE_URL via environment variables.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
})
