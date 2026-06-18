import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../data/warns.json");

interface Warning {
  reason: string;
  moderator: string;
  timestamp: number;
}

type WarnDB = Record<string, Warning[]>;

function loadDB(): WarnDB {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as WarnDB;
  } catch { return {}; }
}

function saveDB(db: WarnDB): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function addWarn(userId: string, reason: string, moderatorTag: string): number {
  const db = loadDB();
  if (!db[userId]) db[userId] = [];
  db[userId]!.push({ reason, moderator: moderatorTag, timestamp: Date.now() });
  saveDB(db);
  return db[userId]!.length;
}

export function getWarns(userId: string): Warning[] {
  return loadDB()[userId] ?? [];
}

export function clearWarns(userId: string): void {
  const db = loadDB();
  db[userId] = [];
  saveDB(db);
}
