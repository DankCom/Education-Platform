import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

export default async function AboutPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const [page] = await sql`SELECT title, content_md, image_path FROM site_pages WHERE slug = 'about'`

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <a href="/dashboard" className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8] transition-colors">
          &larr; Назад
        </a>

        <div className="bg-[#1A1A1C] border border-[#2E2E32] rounded-2xl overflow-hidden">
          {page?.image_path && (
            <div className="w-full">
              <img
                src="/api/about/image"
                alt={page.title || 'Об Академии'}
                className="w-full object-cover max-h-80"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#E8E8E8] mb-6">
              {page?.title || 'Об Академии'}
            </h1>

            {page?.content_md ? (
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-[#E8E8E8] prose-p:text-[#9A9A9F]
                prose-a:text-[#7C6FF7] prose-strong:text-[#E8E8E8]
                prose-code:text-[#E8E8E8] prose-code:bg-[#242426] prose-code:px-1 prose-code:rounded
                prose-li:text-[#9A9A9F]">
                <Markdown remarkPlugins={[remarkBreaks]}>{page.content_md}</Markdown>
              </div>
            ) : (
              <p className="text-[#9A9A9F]">Информация скоро появится</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
