# Marketplace. — Telegram Mini App

This project preserves the existing Next.js/React Marketplace interface and starts removing demo-only behavior. It is a foundation, not a claim that the full marketplace backend is complete.

## Run locally

- Node.js 18.17+ recommended
- `npm install`
- Copy `.env.example` to `.env.local` and set `TELEGRAM_BOT_TOKEN` from BotFather (server-side only)
- `npm run dev`

## Telegram identity

`POST /api/telegram-auth` validates Telegram Mini App `initData` using the bot token and rejects invalid/expired signatures. It derives the owner role only from Telegram numeric ID `998579758`; a username or client-selected role is not sufficient. The endpoint returns identity details, but the current UI has not yet been wired to require this endpoint for every write operation. Do not deploy role-sensitive admin actions until all API routes enforce verified sessions and server-side authorization.

Set the Mini App URL in BotFather and open the site through Telegram to obtain `Telegram.WebApp.initData`. Never put the bot token in a `NEXT_PUBLIC_` variable.

## Current scope and limitations

- Demo listings, sample moderation reports and sample reviews have been removed; the catalogue starts empty.
- `localStorage` persistence has been removed. Current React state is temporary and resets on refresh.
- Listing image selection opens the device photo picker and previews the selected image, but uploading/storing it requires a configured file-storage service and backend endpoint.
- Contact-owner buttons can open Telegram with a prefilled message.
- PostgreSQL/another database, sessions, persistent listings/favorites, moderation workflow, stores, banners, audit log, bans/appeals, reviews and ratings are not yet implemented as a complete backend. They must not be represented as persistent or secure until server endpoints and database migrations are added.

## Required next backend phase

1. Add database schema and migrations for users, listings, photos, stores, reviews, reports, notifications, banners, bans, role assignments and audit events.
2. Exchange verified `initData` for a server-managed session cookie; enforce authorization in every mutating route.
3. Implement object-storage uploads with file validation and size limits.
4. Connect UI actions to API routes and replace temporary state with server responses.
5. Add tests for Telegram signature verification, owner-only actions and moderator permissions.
