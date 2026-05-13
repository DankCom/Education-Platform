import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

// Отметить урок как просмотренный
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lesson_id } = await req.json()
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  await sql`
    INSERT INTO lesson_views (lesson_id, user_id)
    VALUES (${lesson_id}, ${session.userId})
    ON CONFLICT (lesson_id, user_id) DO NOTHING
  `
  return NextResponse.json({ ok: true })
}

// Получить прогресс пользователя по категории
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categoryId = req.nextUrl.searchParams.get('category_id')

  if (categoryId) {
    const catId = parseInt(categoryId, 10)
    if (isNaN(catId)) return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 })

    const [row] = await sql`
      SELECT
        COUNT(DISTINCT l.id) FILTER (WHERE lv.user_id = ${session.userId}) as viewed,
        COUNT(DISTINCT l.id) as total
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      LEFT JOIN lesson_views lv ON lv.lesson_id = l.id AND lv.user_id = ${session.userId}
      WHERE m.category_id = ${catId}
        AND l.is_published = true
        AND m.is_published = true
    `
    return NextResponse.json(row)
  }

  // Все просмотренные уроки пользователя
  const viewed = await sql`
    SELECT lesson_id FROM lesson_views WHERE user_id = ${session.userId}
  `
  return NextResponse.json(viewed.map((r: Record<string, unknown>) => r.lesson_id))
}
