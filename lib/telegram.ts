import crypto from 'crypto'

export function verifyTelegramHash(data: Record<string, string>): boolean {
  const { hash, ...rest } = data
  if (!hash) return false

  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n')

  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest()

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex')

  return hmac === hash
}

export async function checkGroupMembership(userId: number): Promise<boolean> {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_GROUP_ID,
        user_id: userId,
      }),
    }
  )
  const data = await res.json()
  const status = data.result?.status
  return ['member', 'administrator', 'creator'].includes(status)
}
