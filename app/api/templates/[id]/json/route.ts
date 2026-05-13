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
    SELECT title, json_path FROM templates WHERE id = ${templateId} AND is_published = true
  `
  if (!template?.json_path) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const stream = await minioClient.getObject(BUCKET, template.json_path)
    const chunks: Buffer[] = []
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk))
    }
    const filename = `${template.title}.json`
    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
