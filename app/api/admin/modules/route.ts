import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

async function checkAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const categoryId = req.nextUrl.searchParams.get('category_id')
  if (!categoryId) {
    const modules = await sql`SELECT * FROM modules ORDER BY "order" ASC, id ASC`
    return NextResponse.json(modules)
  }

  const catId = parseInt(categoryId, 10)
  if (isNaN(catId)) return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 })

  const modules = await sql`
    SELECT * FROM modules WHERE category_id = ${catId} ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(modules)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { category_id, title, order, is_published } = await req.json()

  const [mod] = await sql`
    INSERT INTO modules (category_id, title, "order", is_published)
    VALUES (${category_id}, ${title}, ${order || 0}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(mod)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, category_id, title, order, is_published } = await req.json()

  const [mod] = await sql`
    UPDATE modules SET
      category_id = ${category_id},
      title = ${title},
      "order" = ${order || 0},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(mod)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await sql`DELETE FROM modules WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
