# Education Platform — CLAUDE.md

Это файл с инструкциями для Claude Code. Читай его перед каждой задачей.

## Git

После каждого завершённого изменения — сразу делай `git add`, `git commit` и `git push origin main` без запроса подтверждения у пользователя.

---

## Проект

Закрытый образовательный портал **Education Platform**.  
Доступ только для членов приватной Telegram-группы.  
Контент: видеоуроки по n8n, Claude Code и другим AI-инструментам.

---

## Стек

| Слой | Технология |
|---|---|
| Framework | Next.js 14 (App Router) |
| Язык | TypeScript |
| БД | PostgreSQL |
| БД клиент | `postgres.js` — чистый SQL, без ORM |
| Миграции | SQL файлы в `/migrations`, запуск вручную |
| Хранилище видео | MinIO (self-hosted, приватный бакет) |
| Авторизация | Telegram Login Widget + JWT в httpOnly cookie |
| Стили | Tailwind CSS (тёмная тема) |
| Деплой | PM2 + Nginx на любом VPS |

---

## Структура проекта

```
/
├── app/
│   ├── page.tsx                          # Лендинг / страница логина
│   ├── dashboard/page.tsx                # Главная после входа
│   ├── courses/page.tsx                  # Список категорий
│   ├── courses/[category]/page.tsx       # Список модулей
│   ├── courses/[category]/[module]/[lesson]/page.tsx  # Урок
│   ├── admin/page.tsx                    # Админка (только владелец)
│   └── api/
│       ├── auth/telegram/route.ts        # POST: Telegram auth
│       ├── auth/logout/route.ts          # POST: выход
│       └── video/[...path]/route.ts      # GET: проксирование видео из MinIO
├── lib/
│   ├── db.ts                             # Подключение postgres.js
│   ├── auth.ts                           # Проверка JWT, helpers
│   ├── minio.ts                          # MinIO клиент
│   └── telegram.ts                       # Verify HMAC, getChatMember
├── middleware.ts                         # Защита роутов через JWT
├── migrations/
│   ├── 001_initial.sql
│   └── 002_add_lessons.sql
└── CLAUDE.md                             # Этот файл
```

---

## База данных

**Используем `postgres.js` — только чистый SQL. Никакого Prisma, никакого Drizzle.**

```typescript
// lib/db.ts
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!)
export default sql
```

Пример запроса:
```typescript
const lessons = await sql`
  SELECT l.*, m.title as module_title
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE m.category_id = ${categoryId}
  ORDER BY l.order ASC
`
```

### Схема таблиц

```sql
-- users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT NOT NULL,
  photo_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories (n8n, Claude Code, и т.д.)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  "order" INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false
);

-- modules (модули внутри категории)
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false
);

-- lessons (уроки внутри модуля)
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_path TEXT,       -- путь в MinIO: "n8n/module-1/lesson-1.mp4"
  content_md TEXT,       -- markdown описание урока
  "order" INT DEFAULT 0,
  duration_min INT,
  is_published BOOLEAN DEFAULT false
);
```

---

## Авторизация

### Схема

```
1. Пользователь нажимает Telegram Login Widget
2. Telegram возвращает: {id, first_name, username, photo_url, hash, auth_date}
3. POST /api/auth/telegram
4. Сервер проверяет подпись HMAC-SHA256 (Bot Token)
5. Сервер вызывает getChatMember(CHAT_ID, user_id) → проверяет статус
6. Если member/administrator → создаём/обновляем юзера в БД
7. Подписываем JWT → кладём в httpOnly cookie "session"
8. Редирект на /dashboard
```

### Проверка подписи Telegram

```typescript
// lib/telegram.ts
import crypto from 'crypto'

export function verifyTelegramHash(data: Record<string, string>): boolean {
  const { hash, ...rest } = data
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
```

### Middleware защита

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from './lib/auth'

const PUBLIC_PATHS = ['/', '/api/auth/telegram']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get('session')?.value
  if (!token || !verifyJWT(token)) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Видео

**MinIO закрыт от интернета.** Видео не отдаётся прямыми ссылками.

Все запросы видео идут через `/api/video/[...path]`:

```typescript
// app/api/video/[...path]/route.ts
// 1. Проверяем JWT из cookie
// 2. Формируем presigned URL в MinIO (TTL 60s)
// 3. Проксируем поток через Response
// В HTML плеере: controlsList="nodownload" disablePictureInPicture
```

MinIO бакет `academy-videos` — приватный, порт 9000 закрыт в firewall, доступен только с localhost.

---

## Переменные окружения

```env
DATABASE_URL=postgresql://user:password@localhost:5432/academy
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_ID=-100xxxxxxxxxx   # ID закрытой группы (отрицательное число)
JWT_SECRET=random_32_char_string
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=academy-videos
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Дизайн

Тёмная тема в стиле Cursor / Linear.

```
Фон страницы:    #0F0F10
Поверхность:     #1A1A1C
Карточки:        #242426
Акцент:          #7C6FF7  (фиолетовый)
Текст primary:   #E8E8E8
Текст muted:     #9A9A9F
Border:          #2E2E32
```

Шрифт: `Inter` или `Geist` (Next.js default).

---

## Правила для Claude Code

### ДЕЛАЙ
- Используй `postgres.js` с чистым SQL для всех запросов к БД
- Проверяй JWT в каждом API route и в middleware
- Все видео запросы проксируй через `/api/video/`
- Добавляй `controlsList="nodownload"` на все `<video>` теги
- Новые категории/модули добавляются через БД, не через код
- Типизируй все возвращаемые данные из SQL через TypeScript interfaces
- Миграции пиши в `/migrations/NNN_name.sql`

### НЕ ДЕЛАЙ
- Не устанавливай Prisma, Drizzle или другие ORM
- Не отдавай прямые MinIO ссылки пользователям
- Не храни JWT в localStorage — только httpOnly cookie
- Не делай публичные роуты без проверки в middleware
- Не хардкодь токены и секреты — только через `.env`
- Не меняй схему БД без создания migration файла

---

## Деплой

Подходит любой VPS с Node.js 20+, PostgreSQL и MinIO. Пример на PM2 + Nginx:

```bash
# Локальная сборка / на сервере
npm ci
npm run build

# Первый запуск через PM2
pm2 start npm --name "academy" -- start
pm2 save
```

Проксируй HTTPS-домен на порт приложения через Nginx. Полная инструкция по
развёртыванию — в `README.md`.

---

## Контент структура

```
Категория (n8n)
  └── Модуль 0: Введение
        └── Урок 1: Что такое n8n
        └── Урок 2: Установка
  └── Модуль 1: Основы
        └── ...
  └── Модуль 2-5: ...

Категория (Claude Code)
  └── Модуль 1: Вайб-кодинг основы
        └── ...
```

Добавление новой категории = INSERT в таблицу `categories`. Код не меняется.

---

*Обновлено: 2026-05*