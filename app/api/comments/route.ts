import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lessonId = req.nextUrl.searchParams.get('lesson_id')
  if (!lessonId) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  const lId = parseInt(lessonId, 10)
  if (isNaN(lId)) return NextResponse.json({ error: 'Invalid lesson_id' }, { status: 400 })

  const comments = await sql`
    SELECT c.id, c.text, c.created_at,
      u.first_name, u.username, u.photo_url,
      u.id as user_id
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.lesson_id = ${lId}
    ORDER BY c.created_at ASC
  `
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lesson_id, text } = await req.json()
  if (!lesson_id || !text?.trim()) {
    return NextResponse.json({ error: 'lesson_id and text required' }, { status: 400 })
  }

  const [comment] = await sql`
    INSERT INTO comments (lesson_id, user_id, text)
    VALUES (${lesson_id}, ${session.userId}, ${text.trim()})
    RETURNING id, text, created_at
  `
  return NextResponse.json(comment)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  // Удалять может сам автор или администратор
  if (session.isAdmin) {
    await sql`DELETE FROM comments WHERE id = ${id}`
  } else {
    await sql`DELETE FROM comments WHERE id = ${id} AND user_id = ${session.userId}`
  }

  return NextResponse.json({ ok: true })
}
