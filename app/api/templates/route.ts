import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await sql`
    SELECT id, title, description, category, image_path, "order"
    FROM templates
    WHERE is_published = true
    ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(templates)
}
