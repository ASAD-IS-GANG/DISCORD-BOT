import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../data/economy.json");

interface UserData {
  balance: number;
  lastDaily: number;
  lastWork: number;
  totalWon: number;
  totalLost: number;
}

type EconomyDB = Record<string, UserData>;

function loadDB(): EconomyDB {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as EconomyDB;
  } catch {
    return {};
  }
}

function saveDB(db: EconomyDB): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getUser(userId: string): UserData {
  const db = loadDB();
  if (!db[userId]) {
    db[userId] = { balance: 500, lastDaily: 0, lastWork: 0, totalWon: 0, totalLost: 0 };
    saveDB(db);
  }
  return db[userId]!;
}

export function setBalance(userId: string, amount: number): void {
  const db = loadDB();
  const user = db[userId] ?? { balance: 500, lastDaily: 0, lastWork: 0, totalWon: 0, totalLost: 0 };
  user.balance = Math.max(0, Math.round(amount));
  db[userId] = user;
  saveDB(db);
}

export function addBalance(userId: string, amount: number): number {
  const user = getUser(userId);
  const newBal = user.balance + Math.round(amount);
  setBalance(userId, newBal);
  if (amount > 0) {
    const db = loadDB();
    db[userId]!.totalWon += Math.round(amount);
    saveDB(db);
  } else {
    const db = loadDB();
    db[userId]!.totalLost += Math.abs(Math.round(amount));
    saveDB(db);
  }
  return Math.max(0, newBal);
}

export function setLastDaily(userId: string): void {
  const db = loadDB();
  const user = db[userId] ?? { balance: 500, lastDaily: 0, lastWork: 0, totalWon: 0, totalLost: 0 };
  user.lastDaily = Date.now();
  db[userId] = user;
  saveDB(db);
}

export function setLastWork(userId: string): void {
  const db = loadDB();
  const user = db[userId] ?? { balance: 500, lastDaily: 0, lastWork: 0, totalWon: 0, totalLost: 0 };
  user.lastWork = Date.now();
  db[userId] = user;
  saveDB(db);
}

export function getLeaderboard(): Array<{ userId: string; balance: number }> {
  const db = loadDB();
  return Object.entries(db)
    .map(([userId, data]) => ({ userId, balance: data.balance }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);
}
