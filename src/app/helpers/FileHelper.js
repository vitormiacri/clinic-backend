import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const databasePath = resolve(__dirname, '..', '..', 'database.json');

const readDatabase = () => {
  return JSON.parse(readFileSync(databasePath, 'utf8'));
};

const writeDatabase = data => {
  const json = JSON.stringify(data, null, 2);
  writeFileSync(databasePath, json);
};

export { readDatabase, writeDatabase };
