import { NextRequest, NextResponse } from 'next/server'
import { verifyTelegramHash, checkGroupMembership } from '@/lib/telegram'
import { signJWT } from '@/lib/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const dataCheck: Record<string, string> = {}
    for (const [key, value] of Object.entries(body)) {
      dataCheck[key] = String(value)
    }

    if (!verifyTelegramHash(dataCheck)) {
      return NextResponse.json({ error: 'Неверная подпись' }, { status: 401 })
    }

    const authDate = parseInt(dataCheck.auth_date, 10)
    if (isNaN(authDate) || Date.now() / 1000 - authDate > 300) {
      return NextResponse.json({ error: 'Данные устарели' }, { status: 401 })
    }

    const telegramId = parseInt(dataCheck.id, 10)
    if (isNaN(telegramId)) {
      return NextResponse.json({ error: 'Неверный ID' }, { status: 400 })
    }

    const isMember = await checkGroupMembership(telegramId)
    if (!isMember) {
      return NextResponse.json(
        { error: 'Вы не являетесь участником группы' },
        { status: 403 }
      )
    }

    const [user] = await sql`
      INSERT INTO users (telegram_id, username, first_name, photo_url, last_login_at)
      VALUES (${telegramId}, ${dataCheck.username || null}, ${dataCheck.first_name}, ${dataCheck.photo_url || null}, NOW())
      ON CONFLICT (telegram_id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        photo_url = EXCLUDED.photo_url,
        last_login_at = NOW()
      RETURNING id, telegram_id, is_admin
    `

    const token = signJWT({
      userId: user.id,
      telegramId: user.telegram_id,
      isAdmin: user.is_admin,
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[auth] Error:', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
