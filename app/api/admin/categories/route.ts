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

  const categories = await sql`
    SELECT * FROM categories ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slug, title, description, icon, order, is_published } = await req.json()

  const [category] = await sql`
    INSERT INTO categories (slug, title, description, icon, "order", is_published)
    VALUES (${slug}, ${title}, ${description || null}, ${icon || null}, ${order || 0}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(category)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, slug, title, description, icon, order, is_published } = await req.json()

  const [category] = await sql`
    UPDATE categories SET
      slug = ${slug},
      title = ${title},
      description = ${description || null},
      icon = ${icon || null},
      "order" = ${order || 0},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(category)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await sql`DELETE FROM categories WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
