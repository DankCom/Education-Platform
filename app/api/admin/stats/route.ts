import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [totals] = await sql`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM lesson_views) as total_views,
      (SELECT COUNT(*) FROM lessons WHERE is_published = true) as total_lessons,
      (SELECT COUNT(*) FROM categories WHERE is_published = true) as total_categories
  `

  const topLessons = await sql`
    SELECT l.title, COUNT(lv.id) as views,
      m.title as module_title, c.title as category_title
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN categories c ON m.category_id = c.id
    LEFT JOIN lesson_views lv ON lv.lesson_id = l.id
    GROUP BY l.id, l.title, m.title, c.title
    ORDER BY views DESC
    LIMIT 10
  `

  const recentUsers = await sql`
    SELECT first_name, username, photo_url, created_at, last_login_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 10
  `

  return NextResponse.json({ totals, topLessons, recentUsers })
}
