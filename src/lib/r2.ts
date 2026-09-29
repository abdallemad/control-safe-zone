import "server-only"

import { S3Client } from "@aws-sdk/client-s3"

// Cloudflare R2 through its S3-compatible API. Credentials live in
// .env.local (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
// R2_BUCKET_NAME, S3_API). Only storage.service.ts imports this.

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.local)`)
  return value
}

let client: S3Client | undefined

/** Created on first use, so a build without R2 variables still compiles. */
export function getR2(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: process.env.S3_API || `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  })
  return client
}

export function getR2Bucket(): string {
  return env("R2_BUCKET_NAME")
}
