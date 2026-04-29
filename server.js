const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

if (!ACCESS_PASSWORD) {
    console.error('❌ ACCESS_PASSWORD не задан в .env');
    process.exit(1);
}

// Хеш пароля
let PASSWORD_HASH;
const HASH_FILE = path.join(__dirname, 'data/password.hash');
if (fs.existsSync(HASH_FILE)) {
    PASSWORD_HASH = fs.readFileSync(HASH_FILE, 'utf8');
} else {
    PASSWORD_HASH = bcrypt.hashSync(ACCESS_PASSWORD, 10);
    fs.writeFileSync(HASH_FILE, PASSWORD_HASH);
    fs.chmodSync(HASH_FILE, 0o600);
}

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Слишком много запросов' }
});
app.use(limiter);

// ============================================================
// АВТОРИЗАЦИЯ
// ============================================================
function requireAuth(req, res, next) {
    const token = req.cookies?.authToken || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.redirect('/login');
    }
    
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.redirect('/login');
    }
}

// Страница логина
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Вход - VPS Finder</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .login-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    width: 400px;
                    max-width: 90%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h1 { text-align: center; margin-bottom: 30px; color: #333; }
                input {
                    width: 100%;
                    padding: 12px 15px;
                    margin-bottom: 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 16px;
                }
                input:focus { outline: none; border-color: #667eea; }
                button {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                }
                .error { color: #e74c3c; text-align: center; margin-bottom: 15px; display: none; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>🔐 VPS Finder</h1>
                <div class="error" id="errorMsg"></div>
                <input type="password" id="password" placeholder="Введите пароль">
                <button onclick="login()">Войти</button>
            </div>
            <script>
                async function login() {
                    const password = document.getElementById('password').value;
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password })
                    });
                    const data = await response.json();
                    if (data.success) {
                        document.cookie = \`authToken=\${data.token}; path=/\`;
                        window.location.href = '/';
                    } else {
                        document.getElementById('errorMsg').textContent = data.error || 'Неверный пароль';
                        document.getElementById('errorMsg').style.display = 'block';
                    }
                }
                document.getElementById('password').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') login();
                });
            </script>
        </body>
        </html>
    `);
});

app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: 'Пароль обязателен' });
    }
    
    const isValid = bcrypt.compareSync(password, PASSWORD_HASH);
    
    if (!isValid) {
        return res.status(401).json({ error: 'Неверный пароль' });
    }
    
    const token = jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
});

// Защита статических файлов
app.use((req, res, next) => {
    if (req.path === '/login') return next();
    if (req.path.startsWith('/api/auth/')) return next();
    
    const token = req.cookies?.authToken;
    if (!token) return res.redirect('/login');
    
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        res.redirect('/login');
    }
});

app.use(express.static('public'));

// ============================================================
// API
// ============================================================
app.get('/api/servers', (req, res) => {
    const dataFile = path.join(__dirname, 'data/vps-data.json');
    if (!fs.existsSync(dataFile)) {
        return res.json({ success: false, servers: [] });
    }
    
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    let servers = [...(data.servers || [])];
    
    const { search, continent, maxPrice } = req.query;
    
    if (search) {
        const s = search.toLowerCase();
        servers = servers.filter(srv => 
            srv.country?.toLowerCase().includes(s) ||
            srv.provider?.toLowerCase().includes(s)
        );
    }
    
    if (continent && continent !== 'all') {
        servers = servers.filter(s => s.continent === continent);
    }
    
    if (maxPrice && !isNaN(maxPrice)) {
        servers = servers.filter(s => s.price && s.price <= parseFloat(maxPrice));
    }
    
    servers.sort((a, b) => (a.price || 9999) - (b.price || 9999));
    
    res.json({
        success: true,
        total: servers.length,
        servers: servers,
        lastUpdate: data.lastUpdate
    });
});

app.get('/api/stats', (req, res) => {
    const dataFile = path.join(__dirname, 'data/vps-data.json');
    if (!fs.existsSync(dataFile)) {
        return res.json({ totalServers: 0 });
    }
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json({
        totalServers: data.servers?.length || 0,
        lastUpdate: data.lastUpdate
    });
});

// ============================================================
// ЗАПУСК
// ============================================================
app.listen(PORT, () => {
    console.log(`🛡️ VPS Finder запущен на http://localhost:${PORT}`);
    console.log(`🔐 Защита паролем активна`);
});
