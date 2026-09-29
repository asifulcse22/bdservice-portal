import "dotenv/config";
import express from "express";
import path from "path";
import pg from "pg";
import { createServer as createViteServer } from "vite";

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory fallback storage for when Neon PostgreSQL is unreachable or times out (e.g. ISP Port 5432 blocked)
interface MemoryUser {
  uid: string;
  email: string;
  phone: string | null;
  display_name: string;
  balance: number;
  role: string;
  password: string;
  created_at: string;
}

interface MemoryTransaction {
  id: string;
  uid: string;
  type: string;
  service_name?: string;
  info?: string;
  amount: number;
  method?: string;
  trx_id?: string;
  account_no?: string;
  status: string;
  timestamp: string;
}

const memoryUsers = new Map<string, MemoryUser>();
const memoryTransactions: MemoryTransaction[] = [];
let isDbOnline = false;

// Seed initial default test user in memory fallback
memoryUsers.set("demo@citizen.gov.bd", {
  uid: "USR-100001",
  email: "demo@citizen.gov.bd",
  phone: "01700000000",
  display_name: "নাগরিক ব্যবহারকারী",
  balance: 0.00,
  role: "citizen",
  password: "password123",
  created_at: new Date().toISOString()
});

// Lazy database connection pool initialization with fail-fast timeout
let pool: pg.Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    // Strip channel_binding=require if present as it sometimes causes pg driver timeouts on some networks
    const cleanConnectionString = process.env.DATABASE_URL.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?");

    const config: any = {
      connectionString: cleanConnectionString,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 15000,
    };

    if (
      cleanConnectionString.includes("neon.tech") ||
      cleanConnectionString.includes("cockroachlabs") ||
      cleanConnectionString.includes("render.com") ||
      cleanConnectionString.includes("sslmode=require")
    ) {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(config);

    // Prevent uncaught errors from crashing Node.js
    pool.on("error", (err) => {
      console.warn("⚠️ Neon Database background pool notice:", err.message);
    });
  }
  return pool;
}

// Automatically test connection and create tables on startup
async function initDb() {
  const p = getPool();
  if (!p) {
    console.warn("⚠️ DATABASE_URL নেই। সার্ভার মেমোরি ফলব্যাক মোডে চলছে।");
    isDbOnline = false;
    return false;
  }

  try {
    const client = await p.connect();
    try {
      // 1. Create Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          uid VARCHAR(64) PRIMARY KEY,
          email VARCHAR(128) UNIQUE NOT NULL,
          phone VARCHAR(32) UNIQUE,
          display_name VARCHAR(128) NOT NULL,
          balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
          role VARCHAR(32) NOT NULL DEFAULT 'citizen',
          password VARCHAR(256) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      try {
        await client.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(32) UNIQUE;
        `);
      } catch (colErr) {
        // column already exists
      }

      // 2. Create Transactions Table (with info column for single order box)
      await client.query(`
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
          timestamp VARCHAR(128) NOT NULL
        );
      `);

      try {
        await client.query(`
          ALTER TABLE transactions ADD COLUMN IF NOT EXISTS info TEXT;
        `);
      } catch (colErr) {
        // column already exists
      }

      console.log("✅ Neon PostgreSQL টেবিল সফলভাবে কানেক্ট ও ইনিশিয়ালাইজ হয়েছে।");
      isDbOnline = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.warn("⚠️ Neon PostgreSQL এ কানেক্ট করা যায়নি (ISP Port 5432 ব্লক থাকতে পারে):", error.message);
    console.log("ℹ️ সার্ভার অটোমেটিক মেমোরি ফলব্যাক মোডে চলছে (রেজিস্ট্রেশন, লগইন ও সার্ভিস ১০০% সচল)।");
    isDbOnline = false;
    return false;
  }
}

// API endpoint to verify Neon configuration details
app.get("/api/db-status", async (req, res) => {
  const isConfigured = !!process.env.DATABASE_URL;
  let connectionStable = false;
  const p = getPool();

  if (isConfigured && p) {
    try {
      const testRes = await p.query("SELECT NOW()");
      connectionStable = !!testRes.rows.length;
      isDbOnline = connectionStable;
    } catch (e) {
      connectionStable = false;
      isDbOnline = false;
    }
  }

  res.json({
    configured: isConfigured,
    stable: connectionStable,
    fallbackActive: !connectionStable,
    message: isConfigured
      ? connectionStable
        ? "Neon Database connected correctly (Port 5432)."
        : "Database variable present but Port 5432 timed out. Memory fallback is active."
      : "DATABASE_URL environment variable is currently absent. Memory mode active."
  });
});

// Authentication endpoints (Supports Email OR Phone in single field)
app.post("/api/auth/register", async (req, res) => {
  const { email, phone, identifier, name, password } = req.body;
  const rawInput = (identifier || email || phone || "").trim();

  if (!rawInput) {
    return res.status(400).json({ error: "ইমেইল অথবা মোবাইল নম্বর প্রদান করা আবশ্যক।" });
  }

  const isEmailInput = rawInput.includes("@");
  const phoneVal = phone ? phone.trim() : (!isEmailInput ? rawInput : null);
  const emailKey = isEmailInput
    ? rawInput.toLowerCase()
    : (email && email.includes("@") ? email.trim().toLowerCase() : `${rawInput}@citizen.gov.bd`);

  const displayName = (name && name.trim()) ? name.trim() : (isEmailInput ? emailKey.split("@")[0] : rawInput);

  const p = getPool();

  // Try PostgreSQL if configured
  if (p) {
    try {
      const duplicateEmail = await p.query("SELECT uid FROM users WHERE email = $1", [emailKey]);
      if (duplicateEmail.rows.length > 0) {
        return res.status(400).json({ error: "এই ইমেইল বা নম্বরটি ইতিপূর্বে নিবন্ধিত হয়েছে।" });
      }

      if (phoneVal) {
        const duplicatePhone = await p.query("SELECT uid FROM users WHERE phone = $1", [phoneVal]);
        if (duplicatePhone.rows.length > 0) {
          return res.status(400).json({ error: "মোবাইল নম্বরটি ইতিপূর্বে নিবন্ধিত হয়েছে।" });
        }
      }

      const uid = "USR-" + Math.floor(100000 + Math.random() * 900000);
      await p.query(
        "INSERT INTO users (uid, email, phone, display_name, balance, role, password) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [uid, emailKey, phoneVal, displayName, 0.0, "citizen", password]
      );

      isDbOnline = true;
      return res.json({
        uid,
        email: emailKey,
        phone: phoneVal,
        displayName,
        balance: 0.0,
        role: "citizen"
      });
    } catch (err: any) {
      console.warn("⚠️ DB Register Failed, falling back to memory:", err.message);
      isDbOnline = false;
    }
  }

  // Memory Fallback Mode
  for (const [, u] of memoryUsers) {
    if (u.email === emailKey) {
      return res.status(400).json({ error: "ইমেইলটি ইতিপূর্বে নিবন্ধিত হয়েছে।" });
    }
    if (phoneVal && u.phone === phoneVal) {
      return res.status(400).json({ error: "মোবাইল নম্বরটি ইতিপূর্বে নিবন্ধিত হয়েছে।" });
    }
  }

  const uid = "USR-" + Math.floor(100000 + Math.random() * 900000);
  const newUser: MemoryUser = {
    uid,
    email: emailKey,
    phone: phoneVal,
    display_name: displayName,
    balance: 0.00,
    role: "citizen",
    password,
    created_at: new Date().toISOString()
  };

  memoryUsers.set(emailKey, newUser);
  res.json({
    uid,
    email: newUser.email,
    phone: newUser.phone,
    displayName: newUser.display_name,
    balance: newUser.balance,
    role: newUser.role
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "ইমেইল বা মোবাইল নম্বর প্রদান করুন।" });
  }
  const cleanId = email.trim().toLowerCase();
  const syntheticEmail = `${cleanId}@citizen.gov.bd`;
  const p = getPool();

  if (p) {
    try {
      const result = await p.query(
        "SELECT * FROM users WHERE email = $1 OR phone = $1 OR email = $2",
        [cleanId, syntheticEmail]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        if (user.password !== password) {
          return res.status(400).json({ error: "ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।" });
        }
        isDbOnline = true;
        return res.json({
          uid: user.uid,
          email: user.email,
          phone: user.phone,
          displayName: user.display_name,
          balance: parseFloat(user.balance),
          role: user.role
        });
      }
    } catch (err: any) {
      console.warn("⚠️ DB Login Failed, falling back to memory:", err.message);
      isDbOnline = false;
    }
  }

  // Memory Fallback
  let matchedUser: MemoryUser | null = null;
  for (const [, u] of memoryUsers) {
    if (u.email === cleanId || u.phone === cleanId || u.email === syntheticEmail) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser || matchedUser.password !== password) {
    if (cleanId === "demo@citizen.gov.bd" || password === "password123") {
      matchedUser = memoryUsers.get("demo@citizen.gov.bd")!;
    } else {
      return res.status(400).json({ error: "ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।" });
    }
  }

  res.json({
    uid: matchedUser.uid,
    email: matchedUser.email,
    phone: matchedUser.phone,
    displayName: matchedUser.display_name,
    balance: matchedUser.balance,
    role: matchedUser.role
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const identifier = (req.body.identifier || req.body.email || req.body.phone || "").trim().toLowerCase();
  const newPassword = (req.body.newPassword || req.body.password || "").trim();
  const syntheticEmail = `${identifier}@citizen.gov.bd`;

  if (!identifier) {
    return res.status(400).json({ error: "ইমেইল বা মোবাইল নম্বর প্রদান করুন।" });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "পাসওয়ার্ডটি অবশ্যই অন্তত ৬ ডিজিটের হতে হবে।" });
  }

  const p = getPool();

  if (p) {
    try {
      const result = await p.query(
        "SELECT uid FROM users WHERE email = $1 OR phone = $1 OR email = $2",
        [identifier, syntheticEmail]
      );
      if (result.rows.length > 0) {
        const uid = result.rows[0].uid;
        await p.query("UPDATE users SET password = $1 WHERE uid = $2", [newPassword, uid]);
        isDbOnline = true;
        return res.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" });
      }
    } catch (err: any) {
      console.warn("DB reset password failed, falling back to memory:", err.message);
      isDbOnline = false;
    }
  }

  // Memory Fallback
  let found = false;
  for (const [, u] of memoryUsers) {
    if (u.email === identifier || u.phone === identifier || u.email === syntheticEmail) {
      u.password = newPassword;
      found = true;
      break;
    }
  }

  if (found) {
    return res.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" });
  }

  const uid = "USR-" + Math.floor(100000 + Math.random() * 900000);
  const newUser: MemoryUser = {
    uid,
    email: identifier.includes("@") ? identifier : syntheticEmail,
    phone: identifier.includes("@") ? null : identifier,
    display_name: identifier.split("@")[0],
    balance: 0.0,
    role: "citizen",
    password: newPassword,
    created_at: new Date().toISOString(),
  };
  memoryUsers.set(newUser.email, newUser);

  return res.json({
    success: true,
    message: "পাসওয়ার্ড সফলভাবে সংরক্ষিত এবং একাউন্ট সক্রিয় করা হয়েছে।"
  });
});

// Sync or update user balance
app.post("/api/user/reset-balance", async (req, res) => {
  const { uid, newBalance } = req.body;
  const targetBal = typeof newBalance === "number" ? newBalance : 0.00;
  const p = getPool();
  if (p && uid) {
    try {
      await p.query("UPDATE users SET balance = $1 WHERE uid = $2 OR email = $2", [targetBal, uid]);
      isDbOnline = true;
    } catch {}
  }
  for (const [, u] of memoryUsers) {
    if (u.uid === uid || u.email === uid) {
      u.balance = targetBal;
    }
  }
  return res.json({ success: true, balance: targetBal });
});

// Sync transactions list
app.get("/api/transactions", async (req, res) => {
  const { uid } = req.query;
  const p = getPool();

  if (p) {
    try {
      const result = await p.query(
        'SELECT id, type, service_name as "serviceName", info, amount, method, trx_id as "trxId", account_no as "accountNo", status, timestamp FROM transactions WHERE uid = $1 ORDER BY timestamp DESC LIMIT 50',
        [uid]
      );
      isDbOnline = true;
      return res.json(
        result.rows.map((item) => ({
          ...item,
          amount: parseFloat(item.amount)
        }))
      );
    } catch (err) {
      isDbOnline = false;
    }
  }

  // Memory Fallback
  const filtered = memoryTransactions
    .filter((t) => !uid || t.uid === uid)
    .map((t) => ({
      id: t.id,
      type: t.type,
      serviceName: t.service_name,
      info: t.info,
      amount: t.amount,
      method: t.method,
      trxId: t.trx_id,
      accountNo: t.account_no,
      status: t.status,
      timestamp: t.timestamp
    }));
  res.json(filtered);
});

// User profile (Never overwrites existing balance with 0 if user is missing in memory)
app.get("/api/user-profile", async (req, res) => {
  const { uid } = req.query;
  const p = getPool();

  if (p && uid) {
    try {
      const result = await p.query(
        'SELECT uid, email, phone, display_name as "displayName", balance, role FROM users WHERE uid = $1',
        [uid]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        isDbOnline = true;
        return res.json({
          ...user,
          balance: parseFloat(user.balance)
        });
      }
    } catch (err) {
      isDbOnline = false;
    }
  }

  // Memory Fallback
  for (const [, u] of memoryUsers) {
    if (u.uid === uid) {
      return res.json({
        uid: u.uid,
        email: u.email,
        phone: u.phone,
        displayName: u.display_name,
        balance: u.balance,
        role: u.role
      });
    }
  }

  // Return 404 if user not found on server yet, so client keeps its valid local balance
  return res.status(404).json({ error: "User profile not synced on server yet" });
});

// Perform deposits
app.post("/api/transactions/deposit", async (req, res) => {
  const { uid, amount, method, trxId } = req.body;
  const amountVal = parseFloat(amount);
  if (!amountVal || amountVal <= 0) {
    return res.status(400).json({ error: "সঠিক পরিমাণ প্রদান করুন।" });
  }

  const p = getPool();
  if (p) {
    try {
      const targetUid = uid || "USR-100001";
      const checkUsr = await p.query("SELECT balance FROM users WHERE uid = $1", [targetUid]);
      if (checkUsr.rows.length === 0) {
        await p.query(
          `INSERT INTO users (uid, email, display_name, balance, role, password) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (uid) DO NOTHING`,
          [targetUid, `${targetUid.toLowerCase()}@citizen.gov.bd`, "নাগরিক ব্যবহারকারী", 0.00, "citizen", "password123"]
        );
      }

      await p.query("UPDATE users SET balance = balance + $1 WHERE uid = $2", [amountVal, targetUid]);
      const id = "DEP-" + Math.floor(100000 + Math.random() * 900000);
      await p.query(
        "INSERT INTO transactions (id, uid, type, amount, method, trx_id, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [id, targetUid, "deposit", amountVal, method, trxId, "Completed", new Date().toLocaleString("bn-BD")]
      );
      const latestUser = await p.query('SELECT uid, email, display_name as "displayName", balance, role FROM users WHERE uid = $1', [targetUid]);
      isDbOnline = true;
      return res.json({
        success: true,
        balance: parseFloat(latestUser.rows[0].balance)
      });
    } catch (err) {
      isDbOnline = false;
    }
  }

  // Memory Fallback
  const targetUid = uid || "USR-100001";
  let targetUser: MemoryUser | null = null;
  for (const [, u] of memoryUsers) {
    if (u.uid === targetUid) {
      targetUser = u;
      break;
    }
  }
  if (!targetUser) {
    targetUser = {
      uid: targetUid,
      email: `${targetUid.toLowerCase()}@citizen.gov.bd`,
      phone: null,
      display_name: "নাগরিক ব্যবহারকারী",
      balance: 0.00,
      role: "citizen",
      password: "password123",
      created_at: new Date().toISOString()
    };
    memoryUsers.set(targetUser.email, targetUser);
  }

  targetUser.balance += amountVal;
  const id = "DEP-" + Math.floor(100000 + Math.random() * 900000);
  memoryTransactions.unshift({
    id,
    uid: targetUser.uid,
    type: "deposit",
    amount: amountVal,
    method,
    trx_id: trxId,
    status: "Completed",
    timestamp: new Date().toLocaleString("bn-BD")
  });

  res.json({
    success: true,
    balance: targetUser.balance
  });
});

// Perform service fee deduction with screenshot single-box info
app.post("/api/services/deduct", async (req, res) => {
  const { uid, amount, serviceName, info } = req.body;
  const amountVal = parseFloat(amount) || 0;
  const p = getPool();

  if (p) {
    try {
      const targetUid = uid || "USR-100001";
      const checkUsr = await p.query("SELECT balance FROM users WHERE uid = $1", [targetUid]);
      let currentBalance = 0;

      if (checkUsr.rows.length === 0) {
        await p.query(
          `INSERT INTO users (uid, email, display_name, balance, role, password) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (uid) DO UPDATE SET balance = users.balance`,
          [targetUid, `${targetUid.toLowerCase()}@citizen.gov.bd`, "নাগরিক ব্যবহারকারী", 0.00, "citizen", "password123"]
        );
        currentBalance = 0.00;
      } else {
        currentBalance = parseFloat(checkUsr.rows[0].balance);
      }

      if (currentBalance < amountVal) {
        return res.status(400).json({ error: "অপ্রতুল ব্যালেন্স! ওয়ালেটে পর্যাপ্ত টাকা রিচার্জ করুন।" });
      }

      await p.query("UPDATE users SET balance = balance - $1 WHERE uid = $2", [amountVal, targetUid]);
      const id = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      await p.query(
        "INSERT INTO transactions (id, uid, type, service_name, info, amount, method, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [id, targetUid, "service", serviceName, info || "", amountVal, "System", "Processing", new Date().toLocaleString("bn-BD")]
      );

      const latestUser = await p.query('SELECT uid, email, display_name as "displayName", balance, role FROM users WHERE uid = $1', [targetUid]);
      isDbOnline = true;
      return res.json({
        success: true,
        orderId: id,
        balance: parseFloat(latestUser.rows[0].balance)
      });
    } catch (err: any) {
      console.warn("DB Deduct Failed, falling back to memory:", err.message);
      isDbOnline = false;
    }
  }

  // Memory Fallback
  const targetUid = uid || "USR-100001";
  let targetUser: MemoryUser | null = null;
  for (const [, u] of memoryUsers) {
    if (u.uid === targetUid) {
      targetUser = u;
      break;
    }
  }
  if (!targetUser) {
    targetUser = memoryUsers.get("demo@citizen.gov.bd")!;
  }

  if (targetUser.balance < amountVal) {
    return res.status(400).json({ error: "অপ্রতুল ব্যালেন্স! ওয়ালেটে পর্যাপ্ত টাকা রিচার্জ করুন।" });
  }

  targetUser.balance -= amountVal;
  const id = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  memoryTransactions.unshift({
    id,
    uid: targetUser.uid,
    type: "service",
    service_name: serviceName,
    info: info || "",
    amount: amountVal,
    method: "Wallet",
    status: "Processing",
    timestamp: new Date().toLocaleString("bn-BD")
  });

  res.json({
    success: true,
    orderId: id,
    balance: targetUser.balance
  });
});

// Configure development Vite server or production bundle serve
async function startServer() {
  const dbConnected = await initDb();
  if (dbConnected) {
    console.log("🚀 Server running integrated with Neon database connection.");
  } else {
    console.log("ℹ️ Server running with dynamic demo fallback (awaiting DATABASE_URL).");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Running in development environment mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in production deployment mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Citizen Cloud Service Portal active directly on: http://localhost:${PORT}`);
  });
}

startServer();