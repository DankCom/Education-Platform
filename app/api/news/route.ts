import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const news = await sql`
    SELECT n.id, n.title, n.summary, n.content_md, n.created_at,
      CASE WHEN nr.user_id IS NOT NULL THEN true ELSE false END as is_read
    FROM news n
    LEFT JOIN news_reads nr ON nr.news_id = n.id AND nr.user_id = ${session.userId}
    WHERE n.is_published = true
    ORDER BY n.created_at DESC
  `

  const unreadCount = news.filter((n: Record<string, unknown>) => !n.is_read).length

  return NextResponse.json({ news, unreadCount })
}
