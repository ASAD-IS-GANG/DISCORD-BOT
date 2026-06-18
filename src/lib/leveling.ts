import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../data/leveling.json");

interface LevelData {
  xp: number;
  level: number;
  totalXp: number;
  lastMessage: number;
}

type LevelDB = Record<string, LevelData>;

function loadDB(): LevelDB {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as LevelDB;
  } catch { return {}; }
}

function saveDB(db: LevelDB): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function xpForLevel(level: number): number {
  return 100 * level * level;
}

export function getLevel(userId: string): LevelData {
  const db = loadDB();
  if (!db[userId]) {
    db[userId] = { xp: 0, level: 0, totalXp: 0, lastMessage: 0 };
    saveDB(db);
  }
  return db[userId]!;
}

export function addXP(userId: string, amount: number): { leveled: boolean; newLevel: number } {
  const db = loadDB();
  const user = db[userId] ?? { xp: 0, level: 0, totalXp: 0, lastMessage: 0 };
  const now = Date.now();
  if (now - user.lastMessage < 60000) return { leveled: false, newLevel: user.level };
  user.lastMessage = now;
  user.xp += amount;
  user.totalXp += amount;
  let leveled = false;
  while (user.xp >= xpForLevel(user.level + 1)) {
    user.xp -= xpForLevel(user.level + 1);
    user.level++;
    leveled = true;
  }
  db[userId] = user;
  saveDB(db);
  return { leveled, newLevel: user.level };
}

export function getLevelLeaderboard(): Array<{ userId: string; level: number; totalXp: number }> {
  const db = loadDB();
  return Object.entries(db)
    .map(([userId, d]) => ({ userId, level: d.level, totalXp: d.totalXp }))
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, 10);
}
