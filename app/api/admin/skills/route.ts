import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

async function checkAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const skills = await sql`
    SELECT * FROM skills ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(skills)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, content_md, file_path, order, is_published } = await req.json()

  if (!title || !file_path) {
    return NextResponse.json({ error: 'title и file_path обязательны' }, { status: 400 })
  }

  const [skill] = await sql`
    INSERT INTO skills (title, description, content_md, file_path, "order", is_published)
    VALUES (${title}, ${description || null}, ${content_md || null}, ${file_path}, ${order || 0}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(skill)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, title, description, content_md, file_path, order, is_published } = await req.json()

  if (!title || !file_path) {
    return NextResponse.json({ error: 'title и file_path обязательны' }, { status: 400 })
  }

  const [skill] = await sql`
    UPDATE skills SET
      title = ${title},
      description = ${description || null},
      content_md = ${content_md || null},
      file_path = ${file_path},
      "order" = ${order || 0},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(skill)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await sql`DELETE FROM skills WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
