# Lab-08 — Integrated Node.js Lab Server

This server integrates the Node.js labs currently present in the repository (Lab 01 to Lab 06) into one portal.

## Run locally

```bash
cd Lab-08
npm install
npm start
```

Open `http://localhost:3000/`.

## Routes

- `/` — integrated portal
- `/about` — project information
- `/health` — server health
- `/labs` — lab registry JSON
- `/labs/:id` — source code and screenshots
- `/labs/:id/run` — run script labs
- `/labs/:id/app/...` — run imported server labs
- `/screenshots/:name` — serve screenshots
- `/api/dashboard` — labs, screenshots and request logs

Lab 07 is not present in the repository, so this integration covers the existing Labs 01–06.
The separate React `student-frontend` project from Lab 05 is not required by this integration server.
