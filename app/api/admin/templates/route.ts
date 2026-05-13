import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { minioClient, BUCKET } from '@/lib/minio'
import sql from '@/lib/db'

async function checkAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const templates = await sql`
    SELECT * FROM templates ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, content_md, category, image_path, json_path, order, is_published } = await req.json()

  const [template] = await sql`
    INSERT INTO templates (title, description, content_md, category, image_path, json_path, "order", is_published)
    VALUES (${title}, ${description || null}, ${content_md || null}, ${category || 'n8n'}, ${image_path || null}, ${json_path || null}, ${order || 0}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(template)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, title, description, content_md, category, image_path, json_path, order, is_published } = await req.json()

  const [template] = await sql`
    UPDATE templates SET
      title = ${title},
      description = ${description || null},
      content_md = ${content_md || null},
      category = ${category || 'n8n'},
      image_path = ${image_path || null},
      json_path = ${json_path || null},
      "order" = ${order || 0},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(template)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()

  const [template] = await sql`SELECT image_path, json_path FROM templates WHERE id = ${id}`
  if (template) {
    for (const path of [template.image_path, template.json_path]) {
      if (path) {
        try { await minioClient.removeObject(BUCKET, path) } catch {}
      }
    }
  }

  await sql`DELETE FROM templates WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
