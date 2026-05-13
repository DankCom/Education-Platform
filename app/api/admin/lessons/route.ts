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

  const moduleId = req.nextUrl.searchParams.get('module_id')
  if (!moduleId) {
    const lessons = await sql`SELECT * FROM lessons ORDER BY "order" ASC, id ASC`
    return NextResponse.json(lessons)
  }

  const modId = parseInt(moduleId, 10)
  if (isNaN(modId)) return NextResponse.json({ error: 'Invalid module_id' }, { status: 400 })

  const lessons = await sql`
    SELECT * FROM lessons WHERE module_id = ${modId} ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(lessons)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { module_id, title, video_path, content_md, order, duration_min, is_published } = await req.json()

  const [lesson] = await sql`
    INSERT INTO lessons (module_id, title, video_path, content_md, "order", duration_min, is_published)
    VALUES (${module_id}, ${title}, ${video_path || null}, ${content_md || null}, ${order || 0}, ${duration_min || null}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(lesson)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, module_id, title, video_path, content_md, order, duration_min, is_published } = await req.json()

  // Удалить старое видео если путь изменился
  const [old] = await sql`SELECT video_path FROM lessons WHERE id = ${id}`
  if (old?.video_path && old.video_path !== (video_path || null)) {
    try {
      await minioClient.removeObject(BUCKET, old.video_path)
    } catch (err) {
      console.error('[lessons] Failed to delete old video from MinIO:', err)
    }
  }

  const [lesson] = await sql`
    UPDATE lessons SET
      module_id = ${module_id},
      title = ${title},
      video_path = ${video_path || null},
      content_md = ${content_md || null},
      "order" = ${order || 0},
      duration_min = ${duration_min || null},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(lesson)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()

  const [lesson] = await sql`SELECT video_path FROM lessons WHERE id = ${id}`
  if (lesson?.video_path) {
    try {
      await minioClient.removeObject(BUCKET, lesson.video_path)
    } catch (err) {
      console.error('[lessons] Failed to delete video from MinIO:', err)
    }
  }

  // Workflow files are deleted via CASCADE + the lesson-workflows API handles MinIO cleanup
  // But let's clean up MinIO files for workflows too
  const wfs = await sql`SELECT json_path FROM lesson_workflows WHERE lesson_id = ${id}`
  for (const wf of wfs) {
    try {
      await minioClient.removeObject(BUCKET, wf.json_path)
    } catch (err) {
      console.error('[lessons] Failed to delete workflow from MinIO:', err)
    }
  }

  await sql`DELETE FROM lessons WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
