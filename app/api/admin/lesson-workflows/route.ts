import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'
import { minioClient, BUCKET } from '@/lib/minio'

async function checkAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const lessonId = req.nextUrl.searchParams.get('lesson_id')
  if (lessonId) {
    const lId = parseInt(lessonId, 10)
    if (isNaN(lId)) return NextResponse.json({ error: 'Invalid lesson_id' }, { status: 400 })
    const workflows = await sql`
      SELECT * FROM lesson_workflows WHERE lesson_id = ${lId} ORDER BY "order" ASC, id ASC
    `
    return NextResponse.json(workflows)
  }

  const workflows = await sql`SELECT * FROM lesson_workflows ORDER BY lesson_id, "order" ASC, id ASC`
  return NextResponse.json(workflows)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { lesson_id, title, json_path, order } = await req.json()

  const [workflow] = await sql`
    INSERT INTO lesson_workflows (lesson_id, title, json_path, "order")
    VALUES (${lesson_id}, ${title}, ${json_path}, ${order || 0})
    RETURNING *
  `
  return NextResponse.json(workflow)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, title, json_path, order } = await req.json()

  const [old] = await sql`SELECT json_path FROM lesson_workflows WHERE id = ${id}`
  if (old?.json_path && old.json_path !== json_path) {
    try {
      await minioClient.removeObject(BUCKET, old.json_path)
    } catch (err) {
      console.error('[lesson-workflows] Failed to delete old file from MinIO:', err)
    }
  }

  const [workflow] = await sql`
    UPDATE lesson_workflows SET
      title = ${title},
      json_path = ${json_path},
      "order" = ${order || 0}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(workflow)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()

  const [workflow] = await sql`SELECT json_path FROM lesson_workflows WHERE id = ${id}`
  if (workflow?.json_path) {
    try {
      await minioClient.removeObject(BUCKET, workflow.json_path)
    } catch (err) {
      console.error('[lesson-workflows] Failed to delete file from MinIO:', err)
    }
  }

  await sql`DELETE FROM lesson_workflows WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
