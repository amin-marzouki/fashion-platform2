import multer from 'multer'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { env } from '../config/env'

// Multer in-memory storage (files are buffered then uploaded to S3)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only images are allowed'))
  },
})

// S3 client
const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

/**
 * Upload a multer file to S3 and return the public URL.
 * If AWS credentials are not configured, returns a local placeholder URL.
 */
export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  if (!env.AWS_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID === 'REPLACE_ME') {
    // Local dev — no S3 configured
    return `/uploads/${folder}/${file.originalname}`
  }

  const key = `${folder}/${Date.now()}-${file.originalname}`
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  })

  await upload.done()
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
}
