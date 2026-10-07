const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execFile } = require('child_process');
const { promisify } = require('util');
const slugify = require('slugify');
const labs = require('./labs');
const { logger, LOG_FILE } = require('./modules/logger');

const execFileAsync = promisify(execFile);
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const SCREENSHOTS_DIR = path.join(__dirname, 'public', 'screenshots');

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

function send(res, status, data) {
    const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': typeof data === 'string' ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8'
    });
    res.end(body);
}

function getLab(id) {
    return labs.find(lab => lab.id === id);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function labPage(lab, source, screenshots) {
    const runLink = lab.type === 'script'
        ? `/labs/${lab.id}/run`
        : `/labs/${lab.id}/app${lab.try || '/'}`;

    const screenshotHtml = screenshots.length
        ? screenshots.map(name => `<div class="shot"><img src="/screenshots/${encodeURIComponent(name)}" alt="${escapeHtml(name)}"><p>${escapeHtml(name)}</p></div>`).join('')
        : '<p>No screenshot uploaded yet. Add the required local/live browser screenshots to <code>public/screenshots</code>.</p>';

    return `<!doctype html>
<html><head><meta charset="utf-8"><title>Lab ${lab.id} - ${escapeHtml(lab.title)}</title>
<style>body{font-family:Arial,sans-serif;max-width:1100px;margin:30px auto;padding:0 20px;background:#f5f7fb;color:#172033}a{color:#155eef}.card{background:white;padding:22px;border-radius:14px;margin:18px 0;box-shadow:0 3px 14px #0001}pre{background:#111827;color:#e5e7eb;padding:18px;border-radius:10px;overflow:auto}.shots{display:flex;gap:20px;flex-wrap:wrap}.shot{max-width:420px}.shot img{max-width:100%;border-radius:10px;border:1px solid #ddd}</style></head>
<body><p><a href="/">← Portal</a> | <a href="/labs">All labs</a></p>
<div class="card"><h1>Lab ${lab.id}: ${escapeHtml(lab.title)}</h1><p><b>Topic:</b> ${escapeHtml(lab.topic)}</p><p><b>Type:</b> ${lab.type}</p><p><a href="${runLink}">▶ Open / Run this lab</a></p></div>
<div class="card"><h2>Source Code</h2><pre>${escapeHtml(source)}</pre></div>
<div class="card"><h2>Screenshots</h2><div class="shots">${screenshotHtml}</div></div>
</body></html>`;
}

async function handler(req, res) {
    logger.emit('request', req.method, req.url);

    try {
        const parsed = url.parse(req.url, true);
        const pathname = parsed.pathname;

        if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

        if (pathname === '/') {
            const environment = process.env.RENDER ? 'live (Render)' : 'local';
            const items = labs.map(lab => `<li><a href="/labs/${lab.id}">Lab ${lab.id}: ${escapeHtml(lab.title)}</a> — ${escapeHtml(lab.type)}</li>`).join('');
            return send(res, 200, `<!doctype html><html><head><meta charset="utf-8"><title>Integrated Node.js Lab Server</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:20px;background:#f5f7fb;color:#172033}.card{background:#fff;padding:25px;border-radius:16px;box-shadow:0 3px 15px #0001}li{margin:12px 0}a{color:#155eef}</style></head><body><div class="card"><h1>Integrated Node.js Lab Server</h1><p><b>Environment:</b> ${environment}</p><p>All available previous labs are connected through one Node.js server.</p><h2>Labs</h2><ol>${items}</ol><p><a href="/about">About</a> · <a href="/health">Health</a> · <a href="/labs">Labs JSON</a> · <a href="/api/dashboard">Dashboard API</a></p></div></body></html>`);
        }

        if (pathname === '/about') {
            return send(res, 200, {
                project: 'Integrated Lab Server',
                name: process.env.STUDENT_NAME || 'Aditya',
                labs: labs.length
            });
        }

        if (pathname === '/health') {
            return send(res, 200, {
                status: 'ok',
                environment: process.env.RENDER ? 'live (Render)' : 'local',
                uptimeSeconds: Math.floor(process.uptime())
            });
        }

        if (pathname === '/labs') {
            return send(res, 200, labs.map(lab => ({ ...lab, slug: slugify(lab.title, { lower: true, strict: true }) })));
        }

        if (pathname === '/api/dashboard') {
            const [logData, screenshotNames] = await Promise.all([
                fs.promises.readFile(LOG_FILE, 'utf8').catch(() => ''),
                fs.promises.readdir(SCREENSHOTS_DIR).catch(() => [])
            ]);
            const screenshots = screenshotNames.filter(name => /\.(png|jpe?g)$/i.test(name));
            const requestsLogged = logData.split('\n').filter(Boolean);
            return send(res, 200, { labs, screenshots, requestsLogged });
        }

        const screenshotMatch = pathname.match(/^\/screenshots\/(.+)$/);
        if (screenshotMatch) {
            const name = path.basename(screenshotMatch[1]);
            if (!/\.(png|jpe?g)$/i.test(name)) return send(res, 400, { error: 'Only .png and .jpg screenshots are allowed' });
            const file = path.join(SCREENSHOTS_DIR, name);
            if (!fs.existsSync(file)) return send(res, 404, { error: 'Screenshot not found' });
            res.writeHead(200, { 'Content-Type': /\.png$/i.test(name) ? 'image/png' : 'image/jpeg' });
            return fs.createReadStream(file).pipe(res);
        }

        const labMatch = pathname.match(/^\/labs\/([^/]+)(?:\/(.*))?$/);
        if (labMatch) {
            const id = labMatch[1];
            const rest = labMatch[2] || '';
            const lab = getLab(id);
            if (!lab) return send(res, 404, { error: 'Unknown lab id', id });

            if (!rest) {
                const file = path.resolve(__dirname, lab.file);
                const source = await fs.promises.readFile(file, 'utf8');
                const allScreenshots = await fs.promises.readdir(SCREENSHOTS_DIR).catch(() => []);
                const screenshots = allScreenshots.filter(name =>
                    new RegExp(`^lab${lab.id}.*\\.(png|jpe?g)$`, 'i').test(name)
                );
                return send(res, 200, labPage(lab, source, screenshots));
            }

            if (rest === 'run') {
                if (lab.type !== 'script') return send(res, 400, { error: 'This lab is a server lab; use /app/... instead of /run' });
                const file = path.resolve(__dirname, lab.file);
                try {
                    const result = await execFileAsync(process.execPath, [file], { timeout: 5000 });
                    return send(res, 200, { ok: true, output: result.stdout, error: result.stderr || '' });
                } catch (error) {
                    return send(res, 200, { ok: false, output: error.stdout || '', error: error.stderr || error.message });
                }
            }

            if (rest === 'app' || rest.startsWith('app/')) {
                if (lab.type !== 'server') return send(res, 400, { error: 'This lab is a script lab; use /run instead of /app' });
                const originalUrl = parsed.pathname.replace(`/labs/${id}/app`, '') || '/';
                const queryString = parsed.search || '';
                req.url = originalUrl + queryString;
                const file = path.resolve(__dirname, lab.file);
                const labHandler = require(file);
                if (typeof labHandler !== 'function') return send(res, 500, { error: 'Lab handler is not exported correctly' });
                return labHandler(req, res);
            }
        }

        return send(res, 404, { error: 'Route not found', path: pathname });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) return send(res, 500, { error: 'Internal Server Error' });
        res.end();
    }
}

const server = http.createServer(handler);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
