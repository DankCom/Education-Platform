import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
})

export const BUCKET = process.env.MINIO_BUCKET || 'academy-videos'

export async function getVideoStream(path: string, offset?: number, length?: number) {
  if (offset !== undefined && length !== undefined) {
    return minioClient.getPartialObject(BUCKET, path, offset, length)
  }
  return minioClient.getObject(BUCKET, path)
}

export async function getVideoStat(path: string) {
  return minioClient.statObject(BUCKET, path)
}
