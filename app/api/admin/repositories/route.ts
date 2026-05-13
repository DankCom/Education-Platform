import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import sql from '@/lib/db'

async function checkAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

function validateUrl(url: string): boolean {
  return /^https?:\/\//.test(url)
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const repositories = await sql`
    SELECT * FROM repositories ORDER BY "order" ASC, id ASC
  `
  return NextResponse.json(repositories)
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, content_md, github_url, order, is_published } = await req.json()

  if (!title || !github_url) {
    return NextResponse.json({ error: 'title и github_url обязательны' }, { status: 400 })
  }
  if (!validateUrl(github_url)) {
    return NextResponse.json({ error: 'github_url должен начинаться с http:// или https://' }, { status: 400 })
  }

  const [repo] = await sql`
    INSERT INTO repositories (title, description, content_md, github_url, "order", is_published)
    VALUES (${title}, ${description || null}, ${content_md || null}, ${github_url}, ${order || 0}, ${is_published ?? false})
    RETURNING *
  `
  return NextResponse.json(repo)
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, title, description, content_md, github_url, order, is_published } = await req.json()

  if (!title || !github_url) {
    return NextResponse.json({ error: 'title и github_url обязательны' }, { status: 400 })
  }
  if (!validateUrl(github_url)) {
    return NextResponse.json({ error: 'github_url должен начинаться с http:// или https://' }, { status: 400 })
  }

  const [repo] = await sql`
    UPDATE repositories SET
      title = ${title},
      description = ${description || null},
      content_md = ${content_md || null},
      github_url = ${github_url},
      "order" = ${order || 0},
      is_published = ${is_published ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(repo)
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await sql`DELETE FROM repositories WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
