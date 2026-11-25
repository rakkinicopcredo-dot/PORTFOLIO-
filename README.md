# Rakki Nico P. Credo – Portfolio

Static portfolio site (HTML/CSS/JS) with two small serverless API routes for the
contact-message board and the project "Like" buttons.

```
public/            the website (served as-is)
  index.html
  registrationform.html
  style.css, app.js, form.js
  images/          all pictures
api/
  messages.js      GET/POST /api/messages
  like.js          GET/POST /api/like
  _redis.js        shared Upstash Redis client
xampp-php/         the original PHP/XAMPP version (local use only, not deployed)
vercel.json  package.json  .env.example
```

## Why the API folder?

Vercel does not run PHP and its file system is read-only, so the PHP files that
wrote `messages.json` / `likes.json` were replaced by Node functions that store
data in a free Upstash Redis database.

## Deploy

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com) choose **Add New → Project** and import the repo
   (leave the framework preset on **Other**; `vercel.json` handles the rest).
3. Open the project → **Storage** (or Marketplace) → add **Upstash Redis** and connect it
   to the project. This creates `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Redeploy** once so the functions see the new variables.

Without step 3 the site still loads; only the messages and Like buttons will show an error.

## Run locally

```bash
npm i -g vercel
npm install
vercel link        # once
vercel env pull    # downloads the Redis variables into .env.local
vercel dev
```

## Notes

- The registration form is client-side only (demo); nothing is stored.
- Linux hosting is case-sensitive: image file names must match the HTML exactly
  (e.g. `Sanwich.jpg`).
- Replace `images/serveradmin.jpg` with your own screenshot (a placeholder is included).
