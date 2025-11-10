import { config } from 'dotenv';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = join(process.cwd(), envFile);

if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}
