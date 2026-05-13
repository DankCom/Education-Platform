'use client'

import { useEffect, useState } from 'react'

interface Category {
  id: number; slug: string; title: string; description: string | null; icon: string | null; order: number; is_published: boolean
}
interface Module {
  id: number; category_id: number; title: string; order: number; is_published: boolean
}
interface Lesson {
  id: number; module_id: number; title: string; video_path: string | null; content_md: string | null; order: number; duration_min: number | null; is_published: boolean
}
interface LessonWorkflow {
  id: number; lesson_id: number; title: string; json_path: string; order: number
}
interface Template {
  id: number; title: string; description: string | null; content_md: string | null; category: string; image_path: string | null; json_path: string | null; order: number; is_published: boolean
}
interface NewsItem {
  id: number; title: string; summary: string; content_md: string | null; is_published: boolean; created_at: string
}
interface Repository {
  id: number; title: string; description: string | null; content_md: string | null; github_url: string; order: number; is_published: boolean
}
interface Skill {
  id: number; title: string; description: string | null; content_md: string | null; file_path: string; order: number; is_published: boolean
}

type Tab = 'categories' | 'modules' | 'lessons' | 'templates' | 'news' | 'repositories' | 'skills' | 'about' | 'stats'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonWorkflows, setLessonWorkflows] = useState<LessonWorkflow[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadCategories(); loadModules(); loadLessons(); loadLessonWorkflows(); loadTemplates(); loadNews(); loadRepositories(); loadSkills() }, [])

  async function apiFetch(url: string, opts?: RequestInit) {
    const res = await fetch(url, opts)
    if (res.status === 403) { setError('Нет прав администратора'); return null }
    if (!res.ok) { setError('Ошибка сервера'); return null }
    return res.json()
  }

  async function loadCategories() {
    const data = await apiFetch('/api/admin/categories')
    if (data) setCategories(data)
  }
  async function loadModules() {
    const data = await apiFetch('/api/admin/modules')
    if (data) setModules(data)
  }
  async function loadLessons() {
    const data = await apiFetch('/api/admin/lessons')
    if (data) setLessons(data)
  }
  async function loadLessonWorkflows() {
    const data = await apiFetch('/api/admin/lesson-workflows')
    if (data) setLessonWorkflows(data)
  }
  async function loadTemplates() {
    const data = await apiFetch('/api/admin/templates')
    if (data) setTemplates(data)
  }
  async function loadNews() {
    const data = await apiFetch('/api/admin/news')
    if (data) setNewsItems(data)
  }
  async function loadRepositories() {
    const data = await apiFetch('/api/admin/repositories')
    if (data) setRepositories(data)
  }
  async function loadSkills() {
    const data = await apiFetch('/api/admin/skills')
    if (data) setSkills(data)
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#1A1A1C] border border-[#2E2E32] rounded-2xl p-8 text-center">
        <p className="text-red-400 text-lg">{error}</p>
        <a href="/dashboard" className="text-[#7C6FF7] text-sm mt-4 inline-block hover:underline">
          Вернуться на главную
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#E8E8E8]">Админ-панель</h1>
          <a href="/dashboard" className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">
            Назад
          </a>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['categories', 'modules', 'lessons', 'templates', 'news', 'repositories', 'skills', 'about', 'stats'] as Tab[]).map(t => {
            const labels: Record<Tab, string> = {
              categories: 'Категории', modules: 'Модули', lessons: 'Уроки',
              templates: 'Шаблоны', news: 'Новости', repositories: 'Репозитории', skills: 'Скиллы', about: 'Об Академии', stats: 'Статистика',
            }
            return (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-[#7C6FF7] text-white' : 'bg-[#1A1A1C] text-[#9A9A9F] hover:text-[#E8E8E8]'
              }`}>
              {labels[t]}
            </button>
            )
          })}
        </div>

        {tab === 'categories' && (
          <CategoriesTab categories={categories} reload={loadCategories} apiFetch={apiFetch} />
        )}
        {tab === 'modules' && (
          <ModulesTab modules={modules} categories={categories} reload={loadModules} apiFetch={apiFetch} />
        )}
        {tab === 'lessons' && (
          <LessonsTab lessons={lessons} modules={modules} categories={categories} workflows={lessonWorkflows} reload={loadLessons} reloadWorkflows={loadLessonWorkflows} apiFetch={apiFetch} />
        )}
        {tab === 'templates' && (
          <TemplatesTab templates={templates} reload={loadTemplates} apiFetch={apiFetch} />
        )}
        {tab === 'news' && (
          <NewsTab news={newsItems} reload={loadNews} apiFetch={apiFetch} />
        )}
        {tab === 'repositories' && (
          <RepositoriesTab repositories={repositories} reload={loadRepositories} apiFetch={apiFetch} />
        )}
        {tab === 'skills' && (
          <SkillsTab skills={skills} reload={loadSkills} apiFetch={apiFetch} />
        )}
        {tab === 'about' && <AboutTab apiFetch={apiFetch} />}
        {tab === 'stats' && <StatsTab />}
      </div>
    </div>
  )
}

/* ======================== CATEGORIES ======================== */

function CategoriesTab({ categories, reload, apiFetch }: {
  categories: Category[]
  reload: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ slug: '', title: '', description: '', icon: '', order: 0, is_published: false })
  const [editId, setEditId] = useState<number | null>(null)

  function resetForm() { setForm({ slug: '', title: '', description: '', icon: '', order: 0, is_published: false }); setEditId(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await apiFetch('/api/admin/categories', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      })
    } else {
      await apiFetch('/api/admin/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить категорию? Все модули и уроки внутри будут удалены.')) return
    await apiFetch('/api/admin/categories', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload()
  }

  function startEdit(c: Category) {
    setEditId(c.id)
    setForm({ slug: c.slug, title: c.title, description: c.description || '', icon: c.icon || '', order: c.order, is_published: c.is_published })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать категорию' : 'Новая категория'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Slug (латиница, без пробелов)" value={form.slug} onChange={v => setForm({ ...form, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="foreign-payment" />
          <Input label="Название" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="n8n Автоматизации" />
          <Input label="Иконка" value={form.icon} onChange={v => setForm({ ...form, icon: v })} placeholder="🔄" />
          <Input label="Порядок" type="number" value={String(form.order)} onChange={v => setForm({ ...form, order: parseInt(v) || 0 })} />
        </div>
        <Input label="Описание" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Курс по автоматизации..." />
        <div className="flex items-center gap-4">
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg p-4 flex items-center gap-4">
            <span className="text-2xl">{c.icon || '📁'}</span>
            <div className="flex-1">
              <p className="text-[#E8E8E8] font-medium">{c.title}</p>
              <p className="text-[#9A9A9F] text-sm">/{c.slug} &middot; порядок: {c.order}</p>
            </div>
            <Badge active={c.is_published}>{c.is_published ? 'Опубл.' : 'Черновик'}</Badge>
            <button onClick={() => startEdit(c)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
            <button onClick={() => handleDelete(c.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-[#9A9A9F] text-center py-8">Нет категорий</p>}
      </div>
    </div>
  )
}

/* ======================== MODULES ======================== */

function ModulesTab({ modules, categories, reload, apiFetch }: {
  modules: Module[]; categories: Category[]
  reload: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ category_id: 0, title: '', order: 0, is_published: false })
  const [editId, setEditId] = useState<number | null>(null)

  function resetForm() { setForm({ category_id: categories[0]?.id || 0, title: '', order: 0, is_published: false }); setEditId(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await apiFetch('/api/admin/modules', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      })
    } else {
      await apiFetch('/api/admin/modules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить модуль? Все уроки внутри будут удалены.')) return
    await apiFetch('/api/admin/modules', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload()
  }

  function startEdit(m: Module) {
    setEditId(m.id)
    setForm({ category_id: m.category_id, title: m.title, order: m.order, is_published: m.is_published })
  }

  const getCatTitle = (id: number) => categories.find(c => c.id === id)?.title || '—'

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать модуль' : 'Новый модуль'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Категория" value={String(form.category_id)} onChange={v => setForm({ ...form, category_id: parseInt(v) })}
            options={categories.map(c => ({ value: String(c.id), label: c.title }))} />
          <Input label="Название" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Введение в n8n" />
          <Input label="Порядок" type="number" value={String(form.order)} onChange={v => setForm({ ...form, order: parseInt(v) || 0 })} />
        </div>
        <div className="flex items-center gap-4">
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="space-y-2">
        {modules.map(m => (
          <div key={m.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[#E8E8E8] font-medium">{m.title}</p>
              <p className="text-[#9A9A9F] text-sm">{getCatTitle(m.category_id)} &middot; порядок: {m.order}</p>
            </div>
            <Badge active={m.is_published}>{m.is_published ? 'Опубл.' : 'Черновик'}</Badge>
            <button onClick={() => startEdit(m)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
            <button onClick={() => handleDelete(m.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
          </div>
        ))}
        {modules.length === 0 && <p className="text-[#9A9A9F] text-center py-8">Нет модулей</p>}
      </div>
    </div>
  )
}

/* ======================== LESSONS ======================== */

function LessonsTab({ lessons, modules, categories, workflows, reload, reloadWorkflows, apiFetch }: {
  lessons: Lesson[]; modules: Module[]; categories: Category[]; workflows: LessonWorkflow[]
  reload: () => Promise<void>; reloadWorkflows: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ module_id: 0, title: '', video_path: '', content_md: '', order: 0, duration_min: '', is_published: false })
  const [editId, setEditId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [filterModuleId, setFilterModuleId] = useState<number>(0)

  // Workflow sub-form
  const [wfForm, setWfForm] = useState({ title: '', json_path: '', order: 0 })
  const [wfEditId, setWfEditId] = useState<number | null>(null)
  const [wfUploading, setWfUploading] = useState(false)
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null)

  function resetForm() { setForm({ module_id: modules[0]?.id || 0, title: '', video_path: '', content_md: '', order: 0, duration_min: '', is_published: false }); setEditId(null) }
  function resetWfForm() { setWfForm({ title: '', json_path: '', order: 0 }); setWfEditId(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, duration_min: form.duration_min ? parseInt(form.duration_min) : null }
    if (editId) {
      await apiFetch('/api/admin/lessons', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...payload })
      })
    } else {
      await apiFetch('/api/admin/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить урок? Все workflow будут удалены.')) return
    await apiFetch('/api/admin/lessons', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload(); await reloadWorkflows()
  }

  function startEdit(l: Lesson) {
    setEditId(l.id)
    setForm({
      module_id: l.module_id, title: l.title, video_path: l.video_path || '',
      content_md: l.content_md || '', order: l.order, duration_min: l.duration_min ? String(l.duration_min) : '',
      is_published: l.is_published
    })
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form.video_path) { alert('Укажите путь видео перед загрузкой'); return }
    setUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('path', form.video_path)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    alert(res.ok ? 'Видео загружено!' : 'Ошибка загрузки')
    setUploading(false); e.target.value = ''
  }

  // Workflow CRUD
  async function handleWfSubmit(e: React.FormEvent, lessonId: number) {
    e.preventDefault()
    if (wfEditId) {
      await apiFetch('/api/admin/lesson-workflows', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wfEditId, ...wfForm })
      })
    } else {
      await apiFetch('/api/admin/lesson-workflows', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId, ...wfForm })
      })
    }
    resetWfForm(); await reloadWorkflows()
  }

  async function handleWfDelete(id: number) {
    if (!confirm('Удалить workflow?')) return
    await apiFetch('/api/admin/lesson-workflows', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reloadWorkflows()
  }

  async function handleWfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !wfForm.json_path) { alert('Укажите путь JSON перед загрузкой'); return }
    setWfUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('path', wfForm.json_path)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    alert(res.ok ? 'JSON загружен!' : 'Ошибка загрузки')
    setWfUploading(false); e.target.value = ''
  }

  const getModTitle = (id: number) => {
    const m = modules.find(m => m.id === id)
    if (!m) return '—'
    const c = categories.find(c => c.id === m.category_id)
    return `${c?.title || '?'} → ${m.title}`
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать урок' : 'Новый урок'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Модуль" value={String(form.module_id)} onChange={v => setForm({ ...form, module_id: parseInt(v) })}
            options={modules.map(m => {
              const c = categories.find(c => c.id === m.category_id)
              return { value: String(m.id), label: `${c?.title || '?'} → ${m.title}` }
            })} />
          <Input label="Название" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Что такое n8n" />
          <Input label="Путь видео в MinIO" value={form.video_path} onChange={v => setForm({ ...form, video_path: v })} placeholder="n8n/module-1/lesson-1.mp4" />
          <Input label="Длительность (мин)" type="number" value={form.duration_min} onChange={v => setForm({ ...form, duration_min: v })} />
          <Input label="Порядок" type="number" value={String(form.order)} onChange={v => setForm({ ...form, order: parseInt(v) || 0 })} />
        </div>
        <Textarea label="Описание (Markdown)" value={form.content_md} onChange={v => setForm({ ...form, content_md: v })} placeholder="# Что такое n8n..." />

        <div className="flex items-center gap-4">
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          <label className={`text-sm cursor-pointer ${uploading ? 'text-[#9A9A9F]' : 'text-[#7C6FF7] hover:underline'}`}>
            {uploading ? 'Загрузка...' : 'Загрузить видео'}
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
          </label>
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <select
          value={filterModuleId}
          onChange={e => setFilterModuleId(parseInt(e.target.value))}
          className="bg-[#242426] border border-[#2E2E32] rounded-lg px-3 py-2 text-sm text-[#E8E8E8] focus:outline-none focus:border-[#7C6FF7]"
        >
          <option value={0}>Все модули</option>
          {modules.map(m => {
            const c = categories.find(c => c.id === m.category_id)
            return <option key={m.id} value={m.id}>{c?.title || '?'} → {m.title}</option>
          })}
        </select>
        <span className="text-[#9A9A9F] text-sm">
          {filterModuleId === 0 ? lessons.length : lessons.filter(l => l.module_id === filterModuleId).length} уроков
        </span>
      </div>

      <div className="space-y-2">
        {lessons.filter(l => filterModuleId === 0 || l.module_id === filterModuleId).map(l => {
          const lessonWfs = workflows.filter(w => w.lesson_id === l.id)
          const isExpanded = expandedLesson === l.id
          return (
            <div key={l.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[#E8E8E8] font-medium">{l.title}</p>
                  <p className="text-[#9A9A9F] text-sm">
                    {getModTitle(l.module_id)} &middot; порядок: {l.order}
                    {l.duration_min && ` · ${l.duration_min} мин`}
                    {l.video_path && ` · ${l.video_path}`}
                    {lessonWfs.length > 0 && ` · 📎 ${lessonWfs.length} workflow`}
                  </p>
                </div>
                <button onClick={() => setExpandedLesson(isExpanded ? null : l.id)}
                  className="text-xs text-[#9A9A9F] hover:text-[#E8E8E8] px-2 py-1 rounded bg-[#1A1A1C]">
                  📎 {lessonWfs.length}
                </button>
                <Badge active={l.is_published}>{l.is_published ? 'Опубл.' : 'Черновик'}</Badge>
                <button onClick={() => startEdit(l)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
                <button onClick={() => handleDelete(l.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
              </div>

              {isExpanded && (
                <div className="border-t border-[#2E2E32] bg-[#1A1A1C] p-4 space-y-3">
                  <p className="text-xs text-[#9A9A9F] font-medium uppercase tracking-wider">Workflow файлы</p>

                  {lessonWfs.map(w => (
                    <div key={w.id} className="flex items-center gap-3 text-sm">
                      <span className="text-[#E8E8E8]">{w.title}</span>
                      <span className="text-[#9A9A9F] text-xs">{w.json_path}</span>
                      <span className="text-[#9A9A9F] text-xs">#{w.order}</span>
                      <div className="flex-1" />
                      <button onClick={() => { setWfEditId(w.id); setWfForm({ title: w.title, json_path: w.json_path, order: w.order }) }}
                        className="text-xs text-[#7C6FF7] hover:underline">Изм.</button>
                      <button onClick={() => handleWfDelete(w.id)}
                        className="text-xs text-red-400 hover:underline">Удал.</button>
                    </div>
                  ))}

                  <form onSubmit={e => handleWfSubmit(e, l.id)} className="flex items-end gap-3 flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <Input label="Название" value={wfForm.title} onChange={v => setWfForm({ ...wfForm, title: v })} placeholder="Nutrition Agent" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Input label="Путь JSON в MinIO" value={wfForm.json_path} onChange={v => setWfForm({ ...wfForm, json_path: v })} placeholder="n8n/module1/workflow.json" />
                    </div>
                    <div className="w-20">
                      <Input label="Порядок" type="number" value={String(wfForm.order)} onChange={v => setWfForm({ ...wfForm, order: parseInt(v) || 0 })} />
                    </div>
                    <label className={`text-sm cursor-pointer pb-2 ${wfUploading ? 'text-[#9A9A9F]' : 'text-[#7C6FF7] hover:underline'}`}>
                      {wfUploading ? '...' : '↑ JSON'}
                      <input type="file" accept=".json,application/json" className="hidden" onChange={handleWfUpload} disabled={wfUploading} />
                    </label>
                    <button type="submit" className="bg-[#7C6FF7] hover:bg-[#6B5FD6] text-white px-3 py-2 rounded-lg text-sm">
                      {wfEditId ? 'Сохр.' : '+'}
                    </button>
                    {wfEditId && <button type="button" onClick={resetWfForm} className="text-xs text-[#9A9A9F] hover:text-[#E8E8E8] pb-2">Отмена</button>}
                  </form>
                </div>
              )}
            </div>
          )
        })}
        {lessons.filter(l => filterModuleId === 0 || l.module_id === filterModuleId).length === 0 && (
          <p className="text-[#9A9A9F] text-center py-8">Нет уроков</p>
        )}
      </div>
    </div>
  )
}

/* ======================== UI COMPONENTS ======================== */

/* ======================== TEMPLATES ======================== */

function TemplatesTab({ templates, reload, apiFetch }: {
  templates: Template[]
  reload: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ title: '', description: '', content_md: '', category: 'n8n', image_path: '', json_path: '', order: 0, is_published: false })
  const [editId, setEditId] = useState<number | null>(null)
  const [uploading, setUploading] = useState<'image' | 'json' | null>(null)

  function resetForm() {
    setForm({ title: '', description: '', content_md: '', category: 'n8n', image_path: '', json_path: '', order: 0, is_published: false })
    setEditId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await apiFetch('/api/admin/templates', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      })
    } else {
      await apiFetch('/api/admin/templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить шаблон?')) return
    await apiFetch('/api/admin/templates', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload()
  }

  function startEdit(t: Template) {
    setEditId(t.id)
    setForm({ title: t.title, description: t.description || '', content_md: t.content_md || '', category: t.category, image_path: t.image_path || '', json_path: t.json_path || '', order: t.order, is_published: t.is_published })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'json') {
    const file = e.target.files?.[0]
    const path = type === 'image' ? form.image_path : form.json_path
    if (!file || !path) {
      alert(`Укажите путь для ${type === 'image' ? 'картинки' : 'JSON'} перед загрузкой`)
      return
    }
    setUploading(type)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('path', path)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) alert('Файл загружен!')
    else alert('Ошибка загрузки')
    setUploading(null)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать шаблон' : 'Новый шаблон'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Название" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Автопостинг в Telegram" />
          <Input label="Категория" value={form.category} onChange={v => setForm({ ...form, category: v })} placeholder="n8n" />
          <Input label="Путь картинки в MinIO" value={form.image_path} onChange={v => setForm({ ...form, image_path: v })} placeholder="templates/autopost/preview.png" />
          <Input label="Путь JSON в MinIO" value={form.json_path} onChange={v => setForm({ ...form, json_path: v })} placeholder="templates/autopost/workflow.json" />
          <Input label="Порядок" type="number" value={String(form.order)} onChange={v => setForm({ ...form, order: parseInt(v) || 0 })} />
        </div>
        <Textarea label="Описание (краткое)" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Автоматически публикует посты..." />
        <Textarea label="Подробное описание (Markdown)" value={form.content_md} onChange={v => setForm({ ...form, content_md: v })} placeholder="## Как использовать&#10;1. Скачай шаблон&#10;2. Импортируй в n8n..." />
        <div className="flex items-center gap-4 flex-wrap">
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          <label className={`text-sm cursor-pointer ${uploading === 'image' ? 'text-[#9A9A9F]' : 'text-[#7C6FF7] hover:underline'}`}>
            {uploading === 'image' ? 'Загрузка...' : 'Загрузить картинку'}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'image')} disabled={!!uploading} />
          </label>
          <label className={`text-sm cursor-pointer ${uploading === 'json' ? 'text-[#9A9A9F]' : 'text-[#7C6FF7] hover:underline'}`}>
            {uploading === 'json' ? 'Загрузка...' : 'Загрузить JSON'}
            <input type="file" accept=".json,application/json" className="hidden" onChange={e => handleUpload(e, 'json')} disabled={!!uploading} />
          </label>
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="space-y-2">
        {templates.map(t => (
          <div key={t.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg p-4 flex items-center gap-4">
            {t.image_path && (
              <img src={`/api/templates/${t.id}/image`} alt={t.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-[#E8E8E8] font-medium">{t.title}</p>
              <p className="text-[#9A9A9F] text-sm">{t.category} &middot; порядок: {t.order}</p>
            </div>
            <Badge active={t.is_published}>{t.is_published ? 'Опубл.' : 'Черновик'}</Badge>
            <button onClick={() => startEdit(t)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
            <button onClick={() => handleDelete(t.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
          </div>
        ))}
        {templates.length === 0 && <p className="text-[#9A9A9F] text-center py-8">Нет шаблонов</p>}
      </div>
    </div>
  )
}

/* ======================== NEWS ======================== */

function NewsTab({ news, reload, apiFetch }: {
  news: NewsItem[]
  reload: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ title: '', summary: '', content_md: '', is_published: false })
  const [editId, setEditId] = useState<number | null>(null)

  function resetForm() { setForm({ title: '', summary: '', content_md: '', is_published: false }); setEditId(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await apiFetch('/api/admin/news', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      })
    } else {
      await apiFetch('/api/admin/news', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить новость?')) return
    await apiFetch('/api/admin/news', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload()
  }

  function startEdit(n: NewsItem) {
    setEditId(n.id)
    setForm({ title: n.title, summary: n.summary, content_md: n.content_md || '', is_published: n.is_published })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать новость' : 'Новая новость'}
        </h2>
        <Input label="Заголовок" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Новый курс по Claude Code" />
        <Textarea label="Краткое описание (видно в колокольчике)" value={form.summary} onChange={v => setForm({ ...form, summary: v })} placeholder="Добавлен новый модуль по..." />
        <Textarea label="Полный текст (Markdown, необязательно)" value={form.content_md} onChange={v => setForm({ ...form, content_md: v })} placeholder="## Подробности&#10;Мы добавили..." />
        <div className="flex items-center gap-4">
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="space-y-2">
        {news.map(n => (
          <div key={n.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[#E8E8E8] font-medium">{n.title}</p>
              <p className="text-[#9A9A9F] text-sm line-clamp-1">{n.summary}</p>
              <p className="text-[#9A9A9F]/60 text-xs mt-1">
                {new Date(n.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <Badge active={n.is_published}>{n.is_published ? 'Опубл.' : 'Черновик'}</Badge>
            <button onClick={() => startEdit(n)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
            <button onClick={() => handleDelete(n.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
          </div>
        ))}
        {news.length === 0 && <p className="text-[#9A9A9F] text-center py-8">Нет новостей</p>}
      </div>
    </div>
  )
}

/* ======================== REPOSITORIES ======================== */

function RepositoriesTab({ repositories, reload, apiFetch }: {
  repositories: Repository[]
  reload: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ title: '', description: '', content_md: '', github_url: '', order: 0, is_published: false })
  const [editId, setEditId] = useState<number | null>(null)

  function resetForm() { setForm({ title: '', description: '', content_md: '', github_url: '', order: 0, is_published: false }); setEditId(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await apiFetch('/api/admin/repositories', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      })
    } else {
      await apiFetch('/api/admin/repositories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить репозиторий?')) return
    await apiFetch('/api/admin/repositories', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload()
  }

  function startEdit(r: Repository) {
    setEditId(r.id)
    setForm({
      title: r.title,
      description: r.description || '',
      content_md: r.content_md || '',
      github_url: r.github_url,
      order: r.order,
      is_published: r.is_published,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать репозиторий' : 'Новый репозиторий'}
        </h2>
        <Input label="Название" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="n8n-telegram-ai-bot" />
        <Input label="Ссылка на GitHub" value={form.github_url} onChange={v => setForm({ ...form, github_url: v })} placeholder="https://github.com/user/repo" />
        <Textarea label="Короткое описание (для карточки в списке)" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Бот, который принимает сообщения в Telegram и отвечает через OpenAI." />
        <Textarea label="Полный README (Markdown, необязательно)" value={form.content_md} onChange={v => setForm({ ...form, content_md: v })} placeholder="## Возможности&#10;- Обработка входящих сообщений..." />
        <div className="flex items-center gap-4">
          <Input label="Порядок" type="number" value={String(form.order)} onChange={v => setForm({ ...form, order: parseInt(v) || 0 })} />
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="space-y-2">
        {repositories.map(r => (
          <div key={r.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[#E8E8E8] font-medium truncate">{r.title}</p>
              <p className="text-[#9A9A9F] text-xs truncate">{r.github_url}</p>
              {r.description && <p className="text-[#9A9A9F] text-sm line-clamp-1 mt-1">{r.description}</p>}
            </div>
            <Badge active={r.is_published}>{r.is_published ? 'Опубл.' : 'Черновик'}</Badge>
            <button onClick={() => startEdit(r)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
            <button onClick={() => handleDelete(r.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
          </div>
        ))}
        {repositories.length === 0 && <p className="text-[#9A9A9F] text-center py-8">Нет репозиториев</p>}
      </div>
    </div>
  )
}

/* ======================== SKILLS ======================== */

function SkillsTab({ skills, reload, apiFetch }: {
  skills: Skill[]
  reload: () => Promise<void>
  apiFetch: (url: string, opts?: RequestInit) => Promise<unknown>
}) {
  const [form, setForm] = useState({ title: '', description: '', content_md: '', file_path: '', order: 0, is_published: false })
  const [editId, setEditId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  function resetForm() { setForm({ title: '', description: '', content_md: '', file_path: '', order: 0, is_published: false }); setEditId(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await apiFetch('/api/admin/skills', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      })
    } else {
      await apiFetch('/api/admin/skills', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    resetForm(); await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить скилл?')) return
    await apiFetch('/api/admin/skills', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    await reload()
  }

  function startEdit(s: Skill) {
    setEditId(s.id)
    setForm({
      title: s.title,
      description: s.description || '',
      content_md: s.content_md || '',
      file_path: s.file_path,
      order: s.order,
      is_published: s.is_published,
    })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form.file_path) { alert('Укажите путь файла перед загрузкой'); return }
    setUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('path', form.file_path)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    alert(res.ok ? 'Файл загружен!' : 'Ошибка загрузки')
    setUploading(false); e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">
          {editId ? 'Редактировать скилл' : 'Новый скилл'}
        </h2>
        <Input label="Название" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="git-commit-helper" />
        <Input label="Путь .md в MinIO" value={form.file_path} onChange={v => setForm({ ...form, file_path: v })} placeholder="skills/git-commit-helper/SKILL.md" />
        <Textarea label="Короткое описание (для карточки в списке)" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Помогает писать осмысленные сообщения коммитов." />
        <Textarea label="Подробное описание (Markdown, необязательно)" value={form.content_md} onChange={v => setForm({ ...form, content_md: v })} placeholder="## Что делает&#10;..." />
        <div className="flex items-center gap-4 flex-wrap">
          <Input label="Порядок" type="number" value={String(form.order)} onChange={v => setForm({ ...form, order: parseInt(v) || 0 })} />
          <Checkbox label="Опубликовано" checked={form.is_published} onChange={v => setForm({ ...form, is_published: v })} />
          <div className="flex-1" />
          <label className={`text-sm cursor-pointer ${uploading ? 'text-[#9A9A9F]' : 'text-[#7C6FF7] hover:underline'}`}>
            {uploading ? 'Загрузка...' : 'Загрузить .md'}
            <input type="file" accept=".md,text/markdown,text/plain" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          {editId && <button type="button" onClick={resetForm} className="text-sm text-[#9A9A9F] hover:text-[#E8E8E8]">Отмена</button>}
          <SubmitBtn>{editId ? 'Сохранить' : 'Добавить'}</SubmitBtn>
        </div>
      </form>

      <div className="space-y-2">
        {skills.map(s => (
          <div key={s.id} className="bg-[#242426] border border-[#2E2E32] rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[#E8E8E8] font-medium truncate">{s.title}</p>
              <p className="text-[#9A9A9F] text-xs truncate">{s.file_path}</p>
              {s.description && <p className="text-[#9A9A9F] text-sm line-clamp-1 mt-1">{s.description}</p>}
            </div>
            <Badge active={s.is_published}>{s.is_published ? 'Опубл.' : 'Черновик'}</Badge>
            <button onClick={() => startEdit(s)} className="text-sm text-[#7C6FF7] hover:underline">Изм.</button>
            <button onClick={() => handleDelete(s.id)} className="text-sm text-red-400 hover:underline">Удал.</button>
          </div>
        ))}
        {skills.length === 0 && <p className="text-[#9A9A9F] text-center py-8">Нет скилов</p>}
      </div>
    </div>
  )
}

/* ======================== ABOUT ======================== */

function AboutTab({ apiFetch }: { apiFetch: (url: string, opts?: RequestInit) => Promise<unknown> }) {
  const [form, setForm] = useState({ title: 'Об Академии', content_md: '', image_path: '' })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch('/api/admin/about').then((data: unknown) => {
      if (data && typeof data === 'object') {
        const d = data as Record<string, string | null>
        setForm({ title: d.title || 'Об Академии', content_md: d.content_md || '', image_path: d.image_path || '' })
      }
      setLoaded(true)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await apiFetch('/api/admin/about', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const path = `about/${file.name}`
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('path', path)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) {
      setForm(prev => ({ ...prev, image_path: path }))
    } else {
      alert('Ошибка загрузки')
    }
    setUploading(false)
    e.target.value = ''
  }

  if (!loaded) return <p className="text-[#9A9A9F] text-center py-12">Загрузка...</p>

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8]">Страница &laquo;Об Академии&raquo;</h2>

        <Input label="Заголовок" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Об Академии" />

        <div>
          <span className="text-[#9A9A9F] text-xs mb-1 block">Фото / обложка</span>
          <div className="flex items-center gap-4">
            {form.image_path && (
              <img src="/api/about/image" alt="Обложка" className="w-32 h-20 object-cover rounded-lg border border-[#2E2E32]" />
            )}
            <div className="flex items-center gap-3">
              <label className={`text-sm cursor-pointer ${uploading ? 'text-[#9A9A9F]' : 'text-[#7C6FF7] hover:underline'}`}>
                {uploading ? 'Загрузка...' : form.image_path ? 'Заменить фото' : 'Загрузить фото'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {form.image_path && (
                <button type="button" onClick={() => setForm({ ...form, image_path: '' })} className="text-xs text-red-400 hover:underline">
                  Убрать
                </button>
              )}
            </div>
          </div>
          {form.image_path && <p className="text-[#9A9A9F]/60 text-xs mt-1">{form.image_path}</p>}
        </div>

        <Textarea label="Описание (Markdown)" value={form.content_md} onChange={v => setForm({ ...form, content_md: v })}
          placeholder="Расскажите об академии, чему здесь учат, кто преподаёт..." />

        <div className="flex items-center gap-4">
          <div className="flex-1" />
          {saved && <span className="text-green-400 text-sm">Сохранено</span>}
          <SubmitBtn>{saving ? 'Сохранение...' : 'Сохранить'}</SubmitBtn>
        </div>
      </div>
    </form>
  )
}

/* ======================== STATS ======================== */

interface Stats {
  totals: { total_users: number; total_views: number; total_lessons: number; total_categories: number }
  topLessons: { title: string; views: number; module_title: string; category_title: string }[]
  recentUsers: { first_name: string; username: string | null; photo_url: string | null; created_at: string; last_login_at: string }[]
}

function StatsTab() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) return <p className="text-[#9A9A9F] text-center py-12">Загрузка...</p>

  const { totals, topLessons, recentUsers } = stats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Пользователей', value: totals.total_users },
          { label: 'Просмотров', value: totals.total_views },
          { label: 'Уроков', value: totals.total_lessons },
          { label: 'Категорий', value: totals.total_categories },
        ].map(s => (
          <div key={s.label} className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[#7C6FF7]">{s.value}</p>
            <p className="text-[#9A9A9F] text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-5 space-y-3">
          <h3 className="text-[#E8E8E8] font-semibold">Топ уроков по просмотрам</h3>
          {topLessons.length === 0 && <p className="text-[#9A9A9F] text-sm">Нет данных</p>}
          {topLessons.map((l, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[#9A9A9F] text-sm w-5 text-right">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-[#E8E8E8] text-sm truncate">{l.title}</p>
                <p className="text-[#9A9A9F] text-xs truncate">{l.category_title} → {l.module_title}</p>
              </div>
              <span className="text-[#7C6FF7] text-sm font-medium">{l.views}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#1A1A1C] border border-[#2E2E32] rounded-xl p-5 space-y-3">
          <h3 className="text-[#E8E8E8] font-semibold">Последние пользователи</h3>
          {recentUsers.map((u, i) => (
            <div key={i} className="flex items-center gap-3">
              {u.photo_url ? (
                <img src={u.photo_url} alt={u.first_name} className="w-7 h-7 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#242426] flex items-center justify-center text-xs text-[#9A9A9F] flex-shrink-0">
                  {u.first_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[#E8E8E8] text-sm truncate">{u.first_name} {u.username && <span className="text-[#9A9A9F]">@{u.username}</span>}</p>
                <p className="text-[#9A9A9F] text-xs">
                  {new Date(u.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <label className="block">
      <span className="text-[#9A9A9F] text-xs mb-1 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#242426] border border-[#2E2E32] rounded-lg px-3 py-2 text-sm text-[#E8E8E8] placeholder-[#9A9A9F]/50 focus:outline-none focus:border-[#7C6FF7]" />
    </label>
  )
}

function Textarea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-[#9A9A9F] text-xs mb-1 block">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        className="w-full bg-[#242426] border border-[#2E2E32] rounded-lg px-3 py-2 text-sm text-[#E8E8E8] placeholder-[#9A9A9F]/50 focus:outline-none focus:border-[#7C6FF7] resize-y" />
    </label>
  )
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className="text-[#9A9A9F] text-xs mb-1 block">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#242426] border border-[#2E2E32] rounded-lg px-3 py-2 text-sm text-[#E8E8E8] focus:outline-none focus:border-[#7C6FF7]">
        <option value="0">Выберите...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-[#2E2E32] bg-[#242426] text-[#7C6FF7] focus:ring-[#7C6FF7]" />
      <span className="text-sm text-[#9A9A9F]">{label}</span>
    </label>
  )
}

function SubmitBtn({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit"
      className="bg-[#7C6FF7] hover:bg-[#6B5FD6] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
      {children}
    </button>
  )
}

function Badge({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      active ? 'bg-green-500/20 text-green-400' : 'bg-[#2E2E32] text-[#9A9A9F]'
    }`}>
      {children}
    </span>
  )
}
