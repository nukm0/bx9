# NEON MARKET — исправленная конфигурация для Vercel

## Что исправлено
- Исправлена синтаксическая ошибка JavaScript в ветке «Избранное», из-за которой весь скрипт не запускался.
- Добавлен отсутствовавший helper `$$` (`querySelectorAll`), который вызывался при рендеринге интерфейса.
- Добавлена Vercel Serverless Function `api/auth/telegram.js` для POST `/api/auth/telegram`. Обычный `server.js` не запускается на Vercel как постоянный сервер.
- `index.html` лежит в корне для Vercel; копия в `public/index.html` оставлена для локального запуска через `server.js`.

## Деплой из GitHub
1. Загрузите содержимое этой папки в корень GitHub-репозитория (не ZIP как единственный файл).
2. В Vercel → Project → Settings → Build and Deployment:
   - Framework Preset: `Other`
   - Root Directory: `./`, если `package.json` лежит в корне
   - Build Command: оставить пустым
   - Output Directory: оставить пустым / по умолчанию
3. В Vercel → Settings → Environment Variables добавьте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_ADMIN_IDS`. Укажите нужные среды (Production, а при необходимости Preview).
4. Сделайте Redeploy последнего коммита.
5. Настройте HTTPS URL Mini App в BotFather.

## Проверка
- Откройте `https://ВАШ-ДОМЕН/api/auth/telegram` в браузере: ожидаемый ответ — `405 method_not_allowed`, так как endpoint принимает только POST.
- В обычном браузере приложение покажет просьбу открыть его внутри Telegram Mini App.
- Если деплой не проходит, смотрите Build Logs и Runtime Logs в Vercel.

## Ограничения
Это исправляет обнаруженные ошибки синтаксиса и конфигурации, но не делает проект production-ready. Данные пока хранятся в `localStorage`, поэтому не синхронизируются между устройствами. Админские действия пока не защищены полноценными серверными API. До реального запуска нужны БД, серверная авторизация и проверка прав для каждого административного действия.
