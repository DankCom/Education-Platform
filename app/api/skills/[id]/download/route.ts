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
  const skillId = parseInt(id, 10)
  if (isNaN(skillId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [skill] = await sql`
    SELECT title, file_path FROM skills WHERE id = ${skillId} AND is_published = true
  `
  if (!skill?.file_path) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const stream = await minioClient.getObject(BUCKET, skill.file_path)
    const chunks: Buffer[] = []
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk))
    }
    const filename = `${skill.title}.md`
    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
