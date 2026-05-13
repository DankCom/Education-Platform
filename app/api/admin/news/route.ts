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

  const news = await sql`SELECT * FROM news ORDER BY created_at DESC`
  return NextResponse.json(news)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, summary, content_md, is_published } = await req.json()

  const [item] = await sql`
    INSERT INTO news (title, summary, content_md, is_published)
    VALUES (${title}, ${summary}, ${content_md || null}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, title, summary, content_md, is_published } = await req.json()

  const [item] = await sql`
    UPDATE news SET
      title = ${title},
      summary = ${summary},
      content_md = ${content_md || null},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await sql`DELETE FROM news WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
