import { z } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(8),
  ANTHROPIC_API_KEY: z.string(),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_S3_BUCKET: z.string().optional().default('fashion-platform'),
  AWS_REGION: z.string().optional().default('eu-west-1'),
  PIXEL_STREAMING_URL: z.string().optional().default('http://localhost:8080'),
  PS_BRIDGE_URL: z.string().optional().default('ws://localhost:8888'),
  RECOMMENDATION_SERVICE_URL: z.string().optional().default('http://localhost:5050'),
  PORT: z.string().optional().default('4000'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
