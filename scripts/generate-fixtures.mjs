import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const fixturesDir = resolve(root, "test/fixtures");

mkdirSync(fixturesDir, { recursive: true });

const TARGETS = [
  { name: "1kb.json", users: 2 },
  { name: "100kb.json", users: 320 },
  { name: "1mb.json", users: 3300 },
  { name: "10mb.json", users: 33000 },
];

const LANGS = ["en", "es", "fr", "de"];
const BIO_LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function user(id) {
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    createdAt: new Date(
      Date.UTC(2020 + (id % 6), id % 12, (id % 28) + 1, id % 24, id % 60),
    ).toISOString(),
    active: id % 3 !== 0,
    score: (id * 12347) % 1000,
    roles: id % 5 === 0 ? ["user", "admin"] : ["user"],
    profile: {
      bio: `User ${id}'s bio. ${BIO_LOREM}`,
      avatar: `https://example.com/avatars/${id}.png`,
      preferences: {
        theme: id % 2 === 0 ? "dark" : "light",
        notifications: id % 3 !== 0,
        language: LANGS[id % 4],
      },
    },
  };
}

for (const target of TARGETS) {
  const users = [];
  for (let i = 1; i <= target.users; i++) users.push(user(i));
  const payload = {
    generatedAt: "2026-05-03T00:00:00.000Z",
    count: users.length,
    users,
  };
  const json = JSON.stringify(payload);
  const path = resolve(fixturesDir, target.name);
  writeFileSync(path, json);
  const kb = (json.length / 1024).toFixed(1);
  console.log(
    `${target.name}: ${json.length.toLocaleString()} bytes (${kb} KB), ${target.users} users`,
  );
}
