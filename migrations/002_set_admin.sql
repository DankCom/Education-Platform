-- Назначить администратора по telegram_id.
-- Сначала войди в портал через Telegram (создастся запись в users),
-- потом замени YOUR_TELEGRAM_ID ниже на свой реальный telegram_id и выполни.
--
-- Узнать свой telegram_id можно у бота @userinfobot или после первого входа:
--   SELECT id, telegram_id, first_name FROM users;

UPDATE users SET is_admin = true WHERE telegram_id = YOUR_TELEGRAM_ID;
