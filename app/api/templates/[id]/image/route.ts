import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { minioClient, BUCKET } from '@/lib/minio'
import sql from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const templateId = parseInt(id, 10)
  if (isNaN(templateId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [template] = await sql`
    SELECT image_path FROM templates WHERE id = ${templateId} AND is_published = true
  `
  if (!template?.image_path) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const stat = await minioClient.statObject(BUCKET, template.image_path)
    const stream = await minioClient.getObject(BUCKET, template.image_path)
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
