import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { minioClient, BUCKET } from '@/lib/minio'
import sql from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [page] = await sql`SELECT image_path FROM site_pages WHERE slug = 'about'`
  if (!page?.image_path) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const stat = await minioClient.statObject(BUCKET, page.image_path)
    const stream = await minioClient.getObject(BUCKET, page.image_path)
    const chunks: Buffer[] = []
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk))
    }
    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': stat.metaData?.['content-type'] || 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
}
