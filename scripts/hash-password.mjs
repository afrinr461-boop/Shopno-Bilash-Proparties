#!/usr/bin/env node
// Generates a password hash in the exact format `src/lib/auth/password.ts`
// expects (`<saltHex>:<hashHex>`, scrypt) — for setting
// ADMIN_BOOTSTRAP_PASSWORD_HASH in .env.local. Deliberately a plain .mjs
// script (not importing the TypeScript module) so it runs with plain
// `node`, no build step or ts-node needed.
//
// Usage: node scripts/hash-password.mjs "your-new-password"

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs \"your-password\"");
  process.exit(1);
}

const salt = randomBytes(16);
const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
console.log(`${salt.toString("hex")}:${derivedKey.toString("hex")}`);
