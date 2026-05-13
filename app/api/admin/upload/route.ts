import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { minioClient, BUCKET } from '@/lib/minio'
import { Readable } from 'stream'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const path = formData.get('path') as string | null

    if (!file || !path) {
      return NextResponse.json({ error: 'file and path are required' }, { status: 400 })
    }

    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    console.log('[upload] Starting upload:', path, 'size:', file.size, 'type:', file.type)

    const arrayBuffer = await file.arrayBuffer()
    const nodeStream = Readable.from(Buffer.from(arrayBuffer))

    await minioClient.putObject(BUCKET, path, nodeStream, file.size, {
      'Content-Type': file.type || 'video/mp4',
    })

    console.log('[upload] Success:', path)
    return NextResponse.json({ ok: true, path })
  } catch (err) {
    console.error('[upload] Error:', err)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
