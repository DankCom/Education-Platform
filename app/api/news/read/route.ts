import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { news_id } = await req.json()
  if (!news_id) return NextResponse.json({ error: 'news_id required' }, { status: 400 })

  const id = parseInt(news_id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid news_id' }, { status: 400 })

  await sql`
    INSERT INTO news_reads (user_id, news_id)
    VALUES (${session.userId}, ${id})
    ON CONFLICT (user_id, news_id) DO NOTHING
  `

  return NextResponse.json({ ok: true })
}
