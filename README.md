# Folio

Folio is a phone-first Bible reader. It keeps your place, suggests an order through the books, tells you what each book is doing, and tracks a daily streak. The desktop layout is the same app with a side navigation.

There is no account and no server. Reading progress stays in the browser on that phone. The scripture text is the King James Version, which is in the public domain.

## What you need to do

You can use Folio on your own phone without paying for anything or submitting it to an app store.

### Read it on your phone

1. Put the site on the internet using one of the hosts below, or run it on your computer and open the preview address.
2. On your phone, open that address.
3. Install it so it opens like an app:
   - **iPhone:** Safari → Share → **Add to Home Screen**.
   - **Android:** Chrome menu → **Install app** or **Add to Home Screen**. If the browser offers an Install button inside Folio (on the You tab), use that.
4. On the You tab, download a backup every so often. That file is the only copy of your place, streak, and bookmarks. A new phone, or clearing browser data, starts empty until you restore the file there.

### Put it on the internet

Folio is a static site. The host only has to build it and serve the `dist` folder. You do not set environment variables, create a database, or run a backend.

Any of these free hosts will do. Create an account, point it at this repository, and use:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 22

[Cloudflare Pages](https://pages.cloudflare.com/), [Netlify](https://www.netlify.com/), and [Vercel](https://vercel.com/) all work. Netlify can also read the `netlify.toml` already in the repo. After the first deploy you get a URL like `something.pages.dev`. Open that URL on your phone.

A custom domain is optional. Buy one if you want (Cloudflare Registrar, Namecheap, or similar) and follow the host's "custom domain" screen. Folio does not care what the domain is.

The address uses a hash (`/#/bible/john/3`), so the host does not need special redirect rules for deep links.

### Reminders

Set a time on the You tab. After that time, opening Folio puts today's reading at the top.

- **Android:** once Folio is installed and notifications are allowed, some Chrome versions can also alert you while the app is closed.
- **iPhone:** a website cannot schedule its own alarm. The in-app reminder still works when you open Folio. For a hard nudge, add an alarm in the Clock app at the same time.

### What this version does not do

- It does not sync between phones by itself. Use **Download a backup** and **Restore a backup** on the You tab.
- It does not include copyrighted translations (NIV, ESV, NLT, and similar). Those need a license from the publisher. The text here is the public-domain King James Version, prepared from the community compilation at [github.com/thiagobodruk/bible](https://github.com/thiagobodruk/bible) (`json/en_kjv.json`).
- Book introductions are original to Folio. They are a reading guide, not a commentary.

## How the reading works

- **Today** gives you the next unread chapters in your plan, then keeps that list for the rest of the day even after you mark it read. Missed days do not stack into a guilt pile.
- **Guide** is the reading order: a first-time path, a short tour of the story, an approximate chronological order, the usual bookshelf order, and a few shorter paths. Each book has a sentence on what it is for.
- **Bible** is the library. Search accepts a reference such as `John 3:16` or `Psalm 23`.
- A **streak** counts a local calendar day when you mark at least one chapter read, or when you tap "Count today" after re-reading. If you have read yesterday but not yet today, the streak stays up until the day ends. One missed day ends the current streak. The longest streak is kept.
- The **pace** (chapters per day) estimates a finish date. Being behind does not change which chapter Today offers; it only tells you how you compare with the pace you chose.

## Develop

```bash
npm install
npm test
npm run dev
npm run build
npm run preview
```

`npm run dev` serves the app at `http://localhost:5173`. The Bible files in `public/bible` are already generated. To rebuild them from the King James source (needs network and Python):

```bash
python3 scripts/prepare_bible.py
```
