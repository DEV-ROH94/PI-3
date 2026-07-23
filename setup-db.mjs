import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:[sb_publishable_d3QE5kLmb3gbbNDRpX-YiA_BXl2SHy4]@db.otaxgkuvpdrlbjysaqtv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const sql = readFileSync(resolve(import.meta.dirname, 'supabase_setup.sql'), 'utf-8');

try {
  await client.connect();
  console.log('Conectado ao banco de dados!');

  await client.query(sql);
  console.log('Todas as tabelas e politicas criadas com sucesso!');

  // Verify tables
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  console.log('\nTabelas criadas:');
  res.rows.forEach(r => console.log(' -', r.table_name));

} catch (err) {
  console.error('Erro:', err.message);
} finally {
  await client.end();
}
