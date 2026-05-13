# Education Platform

Закрытый образовательный портал на Next.js 14 с авторизацией через Telegram
Login Widget. Доступ ограничен участниками выбранной приватной
Telegram-группы. Видео хранится приватно в MinIO и отдаётся через
авторизованный прокси.

Используй этот репозиторий как стартовый шаблон, чтобы развернуть свою
закрытую обучающую платформу — для своего сообщества, курса или внутреннего
обучения.

---

## Что внутри

- **Next.js 14 (App Router)** + TypeScript
- **PostgreSQL** через `postgres.js` — чистый SQL, без ORM
- **Telegram Login Widget + JWT** в httpOnly cookie
- **MinIO** для приватного хранения видео и файлов
- Админка для категорий, модулей, уроков, новостей, шаблонов n8n,
  репозиториев, скиллов
- Тёмная тема в стиле Cursor / Linear (Tailwind CSS)

---

## Требования

- Node.js 20+
- PostgreSQL 14+
- MinIO (или любое S3-совместимое хранилище)
- Telegram-бот ([@BotFather](https://t.me/BotFather))
- Закрытая Telegram-группа, в которой бот — администратор

---

## Быстрый старт (локально)

```bash
# 1. Клонируем репозиторий
git clone <your-fork-url> academy
cd academy

# 2. Устанавливаем зависимости
npm install

# 3. Готовим переменные окружения
cp .env.example .env.local
# открой .env.local и заполни значения

# 4. Создаём БД и накатываем миграции
createdb academy
psql academy -f migrations/001_initial.sql
psql academy -f migrations/003_comments_and_views.sql
psql academy -f migrations/004_templates.sql
psql academy -f migrations/005_lesson_workflow.sql
psql academy -f migrations/006_lesson_workflows.sql
psql academy -f migrations/006_template_content_md.sql
psql academy -f migrations/007_news.sql
psql academy -f migrations/008_about_page.sql
psql academy -f migrations/009_repositories.sql
psql academy -f migrations/010_skills.sql

# 5. Запускаем dev-сервер
npm run dev
# открой http://localhost:3000
```

---

## Настройка Telegram-бота

1. Создай бота через [@BotFather](https://t.me/BotFather): команда `/newbot`,
   получи `TELEGRAM_BOT_TOKEN` и username бота.
2. У того же `@BotFather`: `/setdomain` → укажи домен, на котором будет
   работать портал (для локальной разработки можно `localhost` или туннель
   через ngrok/cloudflared).
3. Добавь бота в свою закрытую Telegram-группу как **администратора** — без
   этого `getChatMember` не сможет проверить участников.
4. Узнай `chat_id` группы — отрицательное число вида `-100xxxxxxxxxx`.
   Удобный способ: переслать любое сообщение из группы боту
   [@userinfobot](https://t.me/userinfobot).
5. Заполни в `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=...
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=твойбот
   TELEGRAM_GROUP_ID=-100xxxxxxxxxx
   ```

---

## Настройка MinIO

```bash
# Запускаем MinIO локально (Docker):
docker run -d --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -v minio-data:/data \
  minio/minio server /data --console-address ":9001"
```

1. Открой http://localhost:9001 → войди.
2. Создай приватный бакет `academy-videos`.
3. Создай Access Key/Secret Key для приложения.
4. Заполни в `.env.local`:
   ```
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=...
   MINIO_SECRET_KEY=...
   MINIO_BUCKET=academy-videos
   ```

В продакшене **не открывай** порт MinIO в интернет — приложение должно
ходить к нему по локальной сети. Видео отдаётся пользователям только через
авторизованный прокси `/api/video/[...path]`.

---

## Назначение администратора

1. Войди в портал через Telegram (создастся запись в `users`).
2. Узнай свой `telegram_id`:
   ```sql
   SELECT id, telegram_id, first_name FROM users;
   ```
3. Открой `migrations/002_set_admin.sql`, замени `YOUR_TELEGRAM_ID` на свой
   и выполни:
   ```bash
   psql academy -f migrations/002_set_admin.sql
   ```
4. Перелогинься — появится доступ к `/admin`.

---

## Деплой в продакшен

Подойдёт любой VPS с Node.js 20+, PostgreSQL и MinIO. Минимальная схема:

```bash
# На сервере
git clone <your-fork-url> /var/www/academy
cd /var/www/academy
npm ci
npm run build

# Накатить миграции (см. раздел "Быстрый старт")

# Запуск через PM2
pm2 start npm --name "academy" -- start
pm2 save
pm2 startup   # выполни команду, которую напечатает pm2
```

Проксируй HTTPS-домен на порт приложения через Nginx / Caddy / Traefik.
Не забудь обновить в `@BotFather` домен бота через `/setdomain` на боевой
URL.

`NEXT_PUBLIC_APP_URL` в `.env.local` должен совпадать с публичным URL
приложения — он используется для редиректа после logout.

---

## Структура проекта

```
app/
├── page.tsx                                # Лендинг + Telegram Login
├── dashboard/page.tsx                      # Главная после входа
├── courses/page.tsx                        # Список категорий
├── courses/[category]/page.tsx             # Список модулей
├── courses/[category]/[module]/[lesson]/   # Страница урока
├── admin/page.tsx                          # Админка (только is_admin)
└── api/
    ├── auth/telegram/route.ts              # POST: Telegram auth
    ├── auth/logout/route.ts                # POST: выход
    └── video/[...path]/route.ts            # GET: проксирование видео
lib/
├── db.ts                                   # postgres.js + типы
├── auth.ts                                 # JWT helpers
├── minio.ts                                # MinIO клиент
└── telegram.ts                             # HMAC verify, getChatMember
middleware.ts                               # Защита роутов JWT
migrations/                                 # SQL миграции
```

---

## Безопасность

- JWT хранится только в **httpOnly cookie** — не доступен из JS.
- Все API-роуты проверяют сессию.
- Видео-файлы **не отдаются прямыми ссылками** — только через
  авторизованный прокси.
- На `<video>` тегах: `controlsList="nodownload"`,
  `disablePictureInPicture` — это не защита от слива, а защита от
  случайного скачивания обычными пользователями.
- В `.env.local` не коммить ничего — он в `.gitignore`. Для шаринга
  переменных — обновляй `.env.example`.

---

## Лицензия

MIT — используй и адаптируй под свои нужды.
