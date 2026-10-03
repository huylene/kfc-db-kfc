import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'kfc.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Khởi tạo kết nối SQLite native
const db = new DatabaseSync(DB_PATH);

// Tự động khởi tạo schema nếu các bảng chưa tồn tại
export function initSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);
  }
}

// Khởi chạy schema ngay khi nạp module
initSchema();

/**
 * Truy vấn danh sách bản ghi
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Array<Object>}
 */
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Truy vấn 1 bản ghi duy nhất
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Object|undefined}
 */
export function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

/**
 * Thực thi câu lệnh chèn/sửa/xóa (INSERT, UPDATE, DELETE)
 * @param {string} sql 
 * @param {Array} params 
 * @returns {{ changes: number, lastInsertRowid: number|bigint }}
 */
export function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export default db;
