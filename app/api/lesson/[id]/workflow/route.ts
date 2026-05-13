import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'
import { minioClient, BUCKET } from '@/lib/minio'

// Download a lesson workflow by workflow ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const workflowId = parseInt(id)
  if (isNaN(workflowId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [workflow] = await sql`
    SELECT lw.json_path, lw.title
    FROM lesson_workflows lw
    JOIN lessons l ON lw.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE lw.id = ${workflowId} AND l.is_published = true AND m.is_published = true
  `
  if (!workflow?.json_path) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let stream
  try {
    stream = await minioClient.getObject(BUCKET, workflow.json_path)
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === 'NoSuchKey') {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }
    throw err
  }

  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const buffer = Buffer.concat(chunks)

  const filename = `${workflow.title}.json`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(buffer.length),
    },
  })
}
