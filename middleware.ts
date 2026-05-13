import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/api/auth/telegram']

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function verifyJWTEdge(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const key = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const sigBytes = base64UrlDecode(parts[2])
    const dataToVerify = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      new Uint8Array(sigBytes),
      new Uint8Array(dataToVerify),
    )
    if (!valid) return false

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])))
    if (payload.exp && payload.exp < Date.now() / 1000) return false

    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('session')?.value
  if (!token || !(await verifyJWTEdge(token))) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
