import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [page] = await sql`SELECT title, content_md, image_path FROM site_pages WHERE slug = 'about'`
  return NextResponse.json(page || { title: 'Об Академии', content_md: null, image_path: null })
}
