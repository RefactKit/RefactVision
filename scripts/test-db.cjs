const postgres = require('postgres');

const url = "postgresql://postgres.jyhfjzchvbnfcyizxbrq:XF1a8ZZyiNTCOqPq@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

console.log('Testing database connection...');
console.log('Host: aws-1-eu-central-1.pooler.supabase.com:6543');
console.log('User: postgres.jyhfjzchvbnfcyizxbrq');

const client = postgres(url, {
  ssl: 'require',
  prepare: false,
  connect_timeout: 10,
});

async function run() {
  try {
    const result = await client`SELECT 1 as ok`;
    console.log('✅ Connection successful!', result);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message || String(error));
  } finally {
    await client.end();
  }
}

run();
