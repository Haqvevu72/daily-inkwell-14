# Daily Pages

Build a web application called a "Daily Reading" platform with two types of users: Admin and Public Readers (no account needed).

Authentication & Roles

Only the Admin needs to log in (email/password authentication).

There is only one admin account, set up manually in the database.

Readers browse the site publicly with no sign-up or login required.

Admin-only pages/routes must be completely hidden and inaccessible to readers — no admin links, buttons, or dashboard elements should appear anywhere in the public UI, and admin routes should redirect anyone who isn't logged in as admin away if they try to access the URL directly.

Admin Features

A private admin dashboard (only accessible after admin login) where they can:

Create, edit, delete, and publish articles

Each article has: title, content (rich text), cover image, category/tag, and publish date

Save articles as drafts or publish them immediately

View a list of all published and draft articles

Reader Features (Public, No Login)

A homepage/feed showing daily published articles, newest first

A reading view for each article with clean, comfortable typography

A theme switcher with preset options: Light, Dark, and Sepia/Reading mode, plus adjustable text size (small/medium/large)

The selected theme/text size should be saved in the browser (localStorage) so it persists on return visits, without needing an account

Readers can browse/search articles by category or date

Readers should NOT see any admin controls, edit buttons, or draft content — only published articles are visible

Design

Clean, minimal, content-focused design optimized for reading (similar to Medium or a news reader app)

Fully responsive for mobile and desktop

Comfortable font choices and spacing for long-form reading

Smooth transition when switching between themes

Tech requirements

Use Supabase for the admin authentication and article database only

Set up row-level security so the public can only read published articles, and only the authenticated admin can create, edit, or view drafts

No database or auth needed for readers — theme preference lives entirely in the browser

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://daily-inkwell-14.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d126687c-5b99-4a2b-9a6c-bfc30d6150e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
