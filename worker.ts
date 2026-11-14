import { neon } from '@neondatabase/serverless';

interface Env {
  DATABASE_URL?: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_w5jCgW2IunMt@ep-falling-bird-a12h83yq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

function getDatabaseUrl(env?: Env): string {
  const raw = env?.DATABASE_URL || DEFAULT_DATABASE_URL;
  return raw.replace('&channel_binding=require', '').replace('?channel_binding=require&', '?');
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

let tablesReady = false;

async function ensureTables(sql: any) {
  if (tablesReady) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE,
        display_name VARCHAR(128) NOT NULL,
        balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        role VARCHAR(32) NOT NULL DEFAULT 'citizen',
        password VARCHAR(256) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) UNIQUE
    `.catch(() => {});

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        uid VARCHAR(64) REFERENCES users(uid) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        service_name VARCHAR(128),
        info TEXT,
        amount NUMERIC(15, 2) NOT NULL,
        method VARCHAR(32),
        trx_id VARCHAR(64),
        account_no VARCHAR(64),
        status VARCHAR(32) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS info TEXT
    `.catch(() => {});

    // Seed default demo user if not present
    await sql`
      INSERT INTO users (uid, email, phone, display_name, balance, role, password)
      VALUES ('USR-100001', 'demo@citizen.gov.bd', '01700000000', 'নাগরিক ব্যবহারকারী', 0.00, 'citizen', 'password123')
      ON CONFLICT (uid) DO NOTHING
    `.catch(() => {});

    tablesReady = true;
  } catch (err) {
    console.warn('ensureTables notice:', err);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Static assets
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === 'OPTIONS') {
      return jsonResponse({ ok: true }, 204);
    }

    const dbUrl = getDatabaseUrl(env);
    const sql = neon(dbUrl);

    // 1. Database Status Check
    if (path === '/api/db-status' && request.method === 'GET') {
      try {
        await sql`SELECT NOW()`;
        await ensureTables(sql);
        return jsonResponse({
          configured: true,
          stable: true,
          fallbackActive: false,
          message: 'Neon Database connected via Cloudflare Worker.',
        });
      } catch (err: any) {
        return jsonResponse({
          configured: true,
          stable: false,
          fallbackActive: true,
          message: err?.message || 'Database connection error.',
        });
      }
    }

    try {
      // 2. Register
      if (path === '/api/auth/register' && request.method === 'POST') {
        await ensureTables(sql);
        const body: any = await request.json().catch(() => ({}));
        const rawInput = String(body.identifier || body.email || body.phone || '').trim();
        const password = String(body.password || '');

        if (!rawInput) {
          return jsonResponse({ error: 'ইমেইল অথবা মোবাইল নম্বর প্রদান করা আবশ্যক।' }, 400);
        }
        if (!password) {
          return jsonResponse({ error: 'পাসওয়ার্ড প্রদান করা আবশ্যক।' }, 400);
        }

        const isEmailInput = rawInput.includes('@');
        const phoneVal =
          body.phone && String(body.phone).trim()
            ? String(body.phone).trim()
            : !isEmailInput
            ? rawInput
            : null;

        const emailKey = isEmailInput
          ? rawInput.toLowerCase()
          : body.email && String(body.email).includes('@')
          ? String(body.email).trim().toLowerCase()
          : `${rawInput}@citizen.gov.bd`;

        const displayName =
          body.name && String(body.name).trim()
            ? String(body.name).trim()
            : isEmailInput
            ? emailKey.split('@')[0]
            : rawInput;

        const dupEmail = await sql`SELECT uid FROM users WHERE email = ${emailKey} LIMIT 1`;
        if (dupEmail.length > 0) {
          return jsonResponse({ error: 'এই ইমেইল বা নম্বরটি ইতিপূর্বে নিবন্ধিত হয়েছে।' }, 400);
        }

        if (phoneVal) {
          const dupPhone = await sql`SELECT uid FROM users WHERE phone = ${phoneVal} LIMIT 1`;
          if (dupPhone.length > 0) {
            return jsonResponse({ error: 'মোবাইল নম্বরটি ইতিপূর্বে নিবন্ধিত হয়েছে।' }, 400);
          }
        }

        const uid = 'USR-' + Math.floor(100000 + Math.random() * 900000);
        await sql`
          INSERT INTO users (uid, email, phone, display_name, balance, role, password)
          VALUES (${uid}, ${emailKey}, ${phoneVal}, ${displayName}, 0.00, 'citizen', ${password})
        `;

        return jsonResponse({
          uid,
          email: emailKey,
          phone: phoneVal,
          displayName,
          balance: 0.0,
          role: 'citizen',
        });
      }

      // 3. Login
      if (path === '/api/auth/login' && request.method === 'POST') {
        await ensureTables(sql);
        const body: any = await request.json().catch(() => ({}));
        const rawId = String(body.email || body.identifier || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (!rawId) {
          return jsonResponse({ error: 'ইমেইল বা মোবাইল নম্বর প্রদান করুন।' }, 400);
        }

        const syntheticEmail = `${rawId}@citizen.gov.bd`;
        const rows = await sql`
          SELECT * FROM users
          WHERE email = ${rawId} OR phone = ${rawId} OR email = ${syntheticEmail}
          LIMIT 1
        `;

        if (rows.length === 0) {
          if (rawId === 'demo@citizen.gov.bd' || rawId === '01700000000' || password === 'password123') {
            return jsonResponse({
              uid: 'USR-100001',
              email: 'demo@citizen.gov.bd',
              phone: '01700000000',
              displayName: 'নাগরিক ব্যবহারকারী',
              balance: 0.0,
              role: 'citizen',
            });
          }
          return jsonResponse({ error: 'ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।' }, 400);
        }

        const user = rows[0];
        if (user.password !== password) {
          return jsonResponse({ error: 'ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।' }, 400);
        }

        return jsonResponse({
          uid: user.uid,
          email: user.email,
          phone: user.phone,
          displayName: user.display_name,
          balance: parseFloat(user.balance || 0),
          role: user.role,
        });
      }

      // 4. Reset Password
      if (path === '/api/auth/reset-password' && request.method === 'POST') {
        await ensureTables(sql);
        const body: any = await request.json().catch(() => ({}));
        const identifier = String(body.identifier || body.email || body.phone || '')
          .trim()
          .toLowerCase();
        const newPassword = String(body.newPassword || body.password || '').trim();

        if (!identifier) {
          return jsonResponse({ error: 'ইমেইল বা মোবাইল নম্বর প্রদান করুন।' }, 400);
        }
        if (!newPassword || newPassword.length < 6) {
          return jsonResponse({ error: 'পাসওয়ার্ডটি অবশ্যই অন্তত ৬ ডিজিটের হতে باشد।' }, 400);
        }

        const syntheticEmail = `${identifier}@citizen.gov.bd`;
        const rows = await sql`
          SELECT uid FROM users
          WHERE email = ${identifier} OR phone = ${identifier} OR email = ${syntheticEmail}
          LIMIT 1
        `;

        if (rows.length === 0) {
          return jsonResponse({ error: 'এই ইমেইল বা নম্বরে কোনো একাউন্ট পাওয়া যায়নি।' }, 404);
        }

        await sql`UPDATE users SET password = ${newPassword} WHERE uid = ${rows[0].uid}`;
        return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
      }

      // 5. User Profile
      if (path === '/api/user-profile' && request.method === 'GET') {
        const uid = url.searchParams.get('uid');
        if (!uid) return jsonResponse({ error: 'uid is required' }, 400);

        const rows = await sql`
          SELECT uid, email, phone, display_name as "displayName", balance, role
          FROM users WHERE uid = ${uid} LIMIT 1
        `;
        if (rows.length === 0) {
          return jsonResponse({ error: 'User not found.' }, 404);
        }
        const user = rows[0];
        return jsonResponse({ ...user, balance: parseFloat(user.balance || 0) });
      }

      // 6. Reset Balance
      if (path === '/api/user/reset-balance' && request.method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const targetBal = typeof body.newBalance === 'number' ? body.newBalance : 0.0;
        if (body.uid) {
          await sql`
            UPDATE users SET balance = ${targetBal}
            WHERE uid = ${body.uid} OR email = ${body.uid}
          `;
        }
        return jsonResponse({ success: true, balance: targetBal });
      }

      // 7. Get Transactions
      if (path === '/api/transactions' && request.method === 'GET') {
        await ensureTables(sql);
        const uid = url.searchParams.get('uid');
        if (!uid) return jsonResponse([]);

        const rows = await sql`
          SELECT id, type, service_name as "serviceName", info, amount, method,
                 trx_id as "trxId", account_no as "accountNo", status, timestamp
          FROM transactions
          WHERE uid = ${uid}
          ORDER BY timestamp DESC
          LIMIT 50
        `;

        return jsonResponse(
          rows.map((item: any) => ({
            ...item,
            amount: parseFloat(item.amount || 0),
          }))
        );
      }

      // 8. Deposit
      if (path === '/api/transactions/deposit' && request.method === 'POST') {
        await ensureTables(sql);
        const body: any = await request.json().catch(() => ({}));
        const amountVal = parseFloat(body.amount);
        if (!amountVal || amountVal <= 0) {
          return jsonResponse({ error: 'সঠিক পরিমাণ প্রদান করুন।' }, 400);
        }

        const targetUid = String(body.uid || '');
        const checkUsr = await sql`SELECT balance FROM users WHERE uid = ${targetUid} LIMIT 1`;
        if (checkUsr.length === 0) {
          return jsonResponse({ error: 'ইউজার পাওয়া যায়নি। দয়া করে আবার লগইন করুন।' }, 404);
        }

        const updated = await sql`
          UPDATE users SET balance = balance + ${amountVal}
          WHERE uid = ${targetUid}
          RETURNING balance
        `;

        const id = 'DEP-' + Math.floor(100000 + Math.random() * 900000);
        await sql`
          INSERT INTO transactions (id, uid, type, amount, method, trx_id, status, timestamp)
          VALUES (${id}, ${targetUid}, 'deposit', ${amountVal}, ${body.method || ''}, ${body.trxId || ''}, 'Completed', NOW())
        `;

        return jsonResponse({
          success: true,
          balance: parseFloat(updated[0].balance),
        });
      }

      // 9. Withdraw
      if (path === '/api/transactions/withdraw' && request.method === 'POST') {
        await ensureTables(sql);
        const body: any = await request.json().catch(() => ({}));
        const amountVal = parseFloat(body.amount);
        const targetUid = String(body.uid || '');

        if (!amountVal || amountVal <= 0) {
          return jsonResponse({ error: 'সঠিক পরিমাণ প্রদান করুন।' }, 400);
        }

        const checkUsr = await sql`SELECT balance FROM users WHERE uid = ${targetUid} LIMIT 1`;
        if (checkUsr.length === 0) {
          return jsonResponse({ error: 'ইউজার পাওয়া যায়নি।' }, 404);
        }

        const currentBalance = parseFloat(checkUsr[0].balance || 0);
        if (currentBalance < amountVal) {
          return jsonResponse({ error: 'অপ্রতুল ব্যালেন্স!' }, 400);
        }

        const updated = await sql`
          UPDATE users SET balance = balance - ${amountVal}
          WHERE uid = ${targetUid}
          RETURNING balance
        `;

        const id = 'WDR-' + Math.floor(100000 + Math.random() * 900000);
        await sql`
          INSERT INTO transactions (id, uid, type, amount, method, account_no, status, timestamp)
          VALUES (${id}, ${targetUid}, 'withdraw', ${amountVal}, ${body.method || ''}, ${body.accountNo || ''}, 'Pending', NOW())
        `;

        return jsonResponse({
          success: true,
          balance: parseFloat(updated[0].balance),
        });
      }

      // 10. Service Fee Deduct
      if (path === '/api/services/deduct' && request.method === 'POST') {
        await ensureTables(sql);
        const body: any = await request.json().catch(() => ({}));
        const amountVal = parseFloat(body.amount) || 0;
        const targetUid = String(body.uid || '');

        const checkUsr = await sql`SELECT balance FROM users WHERE uid = ${targetUid} LIMIT 1`;
        if (checkUsr.length === 0) {
          return jsonResponse({ error: 'ইউজার পাওয়া যায়নি। দয়া করে লগইন করুন।' }, 404);
        }

        const currentBalance = parseFloat(checkUsr[0].balance || 0);
        if (currentBalance < amountVal) {
          return jsonResponse(
            { error: 'অপ্রতুল ব্যালেন্স! ওয়ালেটে পর্যাপ্ত টাকা রিচার্জ করুন।' },
            400
          );
        }

        const updated = await sql`
          UPDATE users SET balance = balance - ${amountVal}
          WHERE uid = ${targetUid}
          RETURNING balance
        `;

        const id = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        await sql`
          INSERT INTO transactions (id, uid, type, service_name, info, amount, method, status, timestamp)
          VALUES (${id}, ${targetUid}, 'service', ${body.serviceName || 'Service'}, ${body.info || ''}, ${amountVal}, 'System', 'Processing', NOW())
        `;

        return jsonResponse({
          success: true,
          orderId: id,
          balance: parseFloat(updated[0].balance),
        });
      }

      return jsonResponse({ error: 'API route not found' }, 404);
    } catch (err: any) {
      console.error('API Error:', err);
      return jsonResponse({ error: err?.message || 'Internal Server Error' }, 500);
    }
  },
};
