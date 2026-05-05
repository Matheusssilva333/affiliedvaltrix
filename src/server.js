const express = require('express');
const { randomUUID } = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 10000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize local database
async function initDB() {
    if (!await fs.pathExists(DB_FILE)) {
        const initialData = {
            users: [],
            affiliates: [],
            sales: [],
            config: {
                lastUpdate: new Date().toISOString()
            }
        };
        await fs.writeJson(DB_FILE, initialData, { spaces: 2 });
        console.log('Local database initialized.');
    }
}

// Database Helpers
async function readDB() {
    return await fs.readJson(DB_FILE);
}

async function writeDB(data) {
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
}

// API Routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, invite_code } = req.body;
        if (!username || !invite_code) return res.status(400).json({ error: 'Missing credentials' });
        const db = await readDB();
        let affiliate = db.affiliates.find(a => a.username === username);
        if (!affiliate) {
            affiliate = { username, invite_code, createdAt: new Date().toISOString() };
            db.affiliates.push(affiliate);
            await writeDB(db);
        } else if (affiliate.invite_code !== invite_code) {
            return res.status(401).json({ error: 'Invalid invite code' });
        }
        res.json({ success: true, user: { username, avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/affiliate/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const db = await readDB();
        
        const userSales = db.sales.filter(s => s.code === username && s.status === 'confirmed');
        const salesCount = userSales.length;
        const totalEarnings = userSales.reduce((acc, sale) => acc + (parseFloat(sale.item_price) * 0.1), 0);
        
        const affiliatesMap = {};
        db.sales.filter(s => s.status === 'confirmed').forEach(s => {
            if (!affiliatesMap[s.code]) affiliatesMap[s.code] = 0;
            affiliatesMap[s.code] += (parseFloat(s.item_price) * 0.1);
        });
        
        const topAffiliates = Object.entries(affiliatesMap)
            .map(([u, comm]) => ({ username: u, commission: `R$ ${comm.toFixed(2).replace('.', ',')}`, avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u}` }))
            .sort((a, b) => parseFloat(b.commission.replace('R$ ', '').replace(',', '.')) - parseFloat(a.commission.replace('R$ ', '').replace(',', '.')))
            .map((aff, idx) => ({ ...aff, rank: idx + 1 }))
            .slice(0, 5);
            
        const withdrawals = (db.withdrawals || []).filter(w => w.username === username);
        
        res.json({
            stats: {
                clicks: salesCount * 3 + 12, // mock clicks 
                sales: salesCount,
                earnings: `R$ ${totalEarnings.toFixed(2).replace('.', ',')}`,
                available: `R$ ${(totalEarnings).toFixed(2).replace('.', ',')}`
            },
            ranking: topAffiliates.length > 0 ? topAffiliates : [
                { rank: 1, username: 'metildes_xpt', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=metildes', commission: 'R$ 55,74' },
                { rank: 2, username: 'i0v3r', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=i0v3r', commission: 'R$ 38,20' }
            ],
            withdrawals: withdrawals.length > 0 ? withdrawals : [
                { id: '1', date: '30 de mar', amount: 'R$ 25,80', status: 'approved', pixKey: '***.456.***-89', recipient: username }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/db', async (req, res) => {
    const key = req.headers['x-api-secret'];
    if (key !== process.env.API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const db = await readDB();
        res.json(db);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read database' });
    }
});

app.post('/api/save', async (req, res) => {
    const key = req.headers['x-api-secret'];
    if (key !== process.env.API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { collection, data } = req.body;
        const db = await readDB();
        
        if (!db[collection]) {
            db[collection] = [];
        }
        
        db[collection].push({
            ...data,
            id: randomUUID(),
            createdAt: new Date().toISOString()
        });
        
        await writeDB(db);
        res.json({ success: true, item: db[collection][db[collection].length - 1] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save to database' });
    }
});

// Affiliate Mock API
app.post('/api/affiliate', async (req, res) => {
    const key = req.headers['x-api-secret'];
    if (key !== process.env.API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { action, code, item_id, item_name, item_price, token, buyer_uid } = req.body;
        const db = await readDB();
        
        if (action === 'create_session') {
            const newToken = `local_session_${randomUUID()}`;
            db.sales.push({
                token: newToken,
                code,
                item_id,
                item_name,
                item_price,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            await writeDB(db);
            return res.json({ token: newToken });
        }
        
        if (action === 'confirm_purchase') {
            const saleIndex = db.sales.findIndex(s => s.token === token);
            if (saleIndex !== -1) {
                db.sales[saleIndex].status = 'confirmed';
                db.sales[saleIndex].buyer_uid = buyer_uid;
                db.sales[saleIndex].confirmedAt = new Date().toISOString();
                await writeDB(db);
                return res.json({ ok: true, commission: (db.sales[saleIndex].item_price * 0.1).toFixed(2) });
            }
            return res.status(404).json({ ok: false, reason: 'Session not found' });
        }
        
        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Proxy Route for Roblox APIs (to avoid CORS and Supabase dependency locally)
app.get('/api/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).json({ error: 'Missing url parameter' });

        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch from Roblox API' });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
