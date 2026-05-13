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

  const [page] = await sql`SELECT * FROM site_pages WHERE slug = 'about'`
  return NextResponse.json(page || { slug: 'about', title: 'Об Академии', content_md: '', image_path: '' })
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, content_md, image_path } = await req.json()

  const [page] = await sql`
    INSERT INTO site_pages (slug, title, content_md, image_path, updated_at)
    VALUES ('about', ${title}, ${content_md || null}, ${image_path || null}, NOW())
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content_md = EXCLUDED.content_md,
      image_path = EXCLUDED.image_path,
      updated_at = NOW()
    RETURNING *
  `
  return NextResponse.json(page)
}
