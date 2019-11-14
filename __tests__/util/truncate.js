import { truncateSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const databasePath = resolve(__dirname, '..', '..', 'src', 'database.json');

const databaseDefault = JSON.stringify([]);

export default function truncateFile() {
  truncateSync(databasePath, 0, () => {});
  writeFileSync(databasePath, databaseDefault);
}
