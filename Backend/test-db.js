const { Pool } = require('pg');

// Koristimo ista podešavanja kao u server.js
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'benko_db',
  password: 'admin1234',
  port: 5432,
});

async function testDatabase() {
  try {
    console.log('\n--- 🔍 TESTIRANJE BAZE PODATAKA ---');
    
    // 1. Testiranje konekcije
    console.log('1. Povezujem se na bazu...');
    const client = await pool.connect();
    console.log('✅ Uspešna konekcija!\n');

    // 2. Provera da li tabela postoji
    console.log("2. Proveravam tabelu 'products'...");
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log("✅ Tabela 'products' postoji.\n");
    } else {
      console.log("❌ Tabela 'products' NE postoji. Pokreni server.js da bi se kreirala.\n");
      return;
    }

    // 3. Izlistavanje proizvoda
    console.log("3. Učitavam proizvode...");
    const res = await client.query('SELECT * FROM products');
    console.log(`📦 Pronađeno ${res.rows.length} proizvoda u bazi:`);
    
    // Prikaz u obliku tabele u terminalu
    console.table(res.rows.map(p => ({ id: p.id, naziv: p.name, cena: p.price + ' RSD' })));

    client.release();
  } catch (err) {
    console.error('❌ GREŠKA:', err.message);
  } finally {
    await pool.end();
  }
}

testDatabase();