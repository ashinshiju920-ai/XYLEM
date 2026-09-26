<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Xylem Bookstore

React/Vite storefront with Cloudflare Pages Functions, D1/KV persistence, and Cashfree checkout.

View your app in AI Studio: https://ai.studio/apps/e615ca18-821c-4652-b730-e447b534f72c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Cloudflare Pages deployment

This is a Pages project, not a standalone Workers project. Configure the Pages project with:

- Build command: `bun run build`
- Build output directory: `dist`
- Deploy command (only when using a custom deploy step): `bun run deploy`

Do not use `npx wrangler deploy`; that command requires a Worker entry point (`main`) and causes the
`Missing entry-point` error for this Pages application. The repository deploy script uses
`wrangler pages deploy dist --project-name xylem`.
