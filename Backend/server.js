const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Koristimo PostgreSQL
const app = express();
const PORT = process.env.PORT || 5000; // Koristi port koji dodeli server ili 5000 lokalno

app.use(cors({
  origin: ['https://frontend-myks.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(express.json());

// --- POVEZIVANJE SA BAZOM ---
// Konfiguracija za PostgreSQL (Radi i lokalno i na internetu)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Obavezno za većinu cloud baza (Render, Neon...)
    })
  : new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'benko_db',
      password: 'admin1234', // <--- Ako si zaboravio, promeni je u pgAdmin-u
      port: 5432,
    });

// Provera konekcije
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Greška pri povezivanju sa bazom:', err.stack);
  }
  console.log('Uspešno povezan sa PostgreSQL bazom.');
  release();
  inicijalizujBazu();
});

// --- POMOĆNE FUNKCIJE ---
async function dbRun(sql, params = []) {
  return await pool.query(sql, params);
}

async function dbGet(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

async function dbAll(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

// --- RUTE ---

// Ruta za registraciju novog korisnika
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Provera da li korisnik već postoji
    const existingUser = await dbGet("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Korisničko ime već postoji.' });
    }

    // Ubacivanje novog korisnika
    await dbRun("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", [username, password, email]);
    res.status(201).json({ message: `Korisnik ${username} je uspešno registrovan!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru prilikom registracije.' });
  }
});

// Ruta za prijavu (Login)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await dbGet("SELECT * FROM users WHERE username = $1", [username]);
    if (!user) {
      return res.status(400).json({ message: 'Korisnik ne postoji.' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Pogrešna lozinka.' });
    }

    res.json({ message: 'Uspešna prijava!', username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// Ruta za ručno dodavanje proizvoda (za Admina ili testiranje)
app.post('/api/products', async (req, res) => {
  const { name, price, image } = req.body;
  try {
    await dbRun("INSERT INTO products (name, price, image) VALUES ($1, $2, $3)", [name, price, image]);
    res.status(201).json({ message: 'Proizvod uspešno dodat!' });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dodavanju proizvoda.' });
  }
});

// 1. Ruta za dobijanje svih proizvoda iz baze
app.get('/api/products', async (req, res) => {
  try {
    const productsFromDb = await dbAll("SELECT * FROM products");
    res.json(productsFromDb);
  } catch (error) {
    console.error('Greška pri preuzimanju proizvoda:', error);
    res.status(500).json({ message: 'Greška na serveru pri preuzimanju proizvoda.' });
  }
});

// 2. Ruta za dobijanje sadržaja korpe
app.get('/api/cart', async (req, res) => {
  try {
    // Spajamo cart i products tabelu da dobijemo sve podatke, ali za sad jednostavnije:
    // Čuvamo sve u cart tabeli radi jednostavnosti kao u MongoDB primeru
    const cartItems = await dbAll("SELECT * FROM cart");
    
    // Postgres vraća imena kolona malim slovima (productid), mapiramo u 'id' za frontend
    const formatted = cartItems.map(item => ({ ...item, id: item.productid }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri učitavanju korpe.' });
  }
});

// 3. Ruta za dodavanje u korpu
app.post('/api/cart', async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    // 1. Nađi proizvod
    const proizvod = await dbGet("SELECT * FROM products WHERE id = $1", [productId]);
    if (!proizvod) return res.status(404).json({ message: 'Proizvod nije pronađen.' });

    // 2. Proveri da li je već u korpi
    const cartItem = await dbGet("SELECT * FROM cart WHERE productId = $1", [productId]);

    if (cartItem) {
      // Update
      const newQuantity = cartItem.quantity + (quantity || 1);
      const newTotal = newQuantity * cartItem.price;
      await dbRun("UPDATE cart SET quantity = $1, totalPrice = $2 WHERE productId = $3", [newQuantity, newTotal, productId]);
    } else {
      // Insert
      const qty = quantity || 1;
      const total = qty * proizvod.price;
      await dbRun(
        "INSERT INTO cart (productId, name, price, image, quantity, totalPrice) VALUES ($1, $2, $3, $4, $5, $6)",
        [proizvod.id, proizvod.name, proizvod.price, proizvod.image, qty, total]
      );
    }

    // Vrati novu korpu
    const allItems = await dbAll("SELECT * FROM cart");
    const formatted = allItems.map(item => ({ ...item, id: item.productid }));
    res.status(200).json({ message: 'Proizvod dodat u korpu', korpa: formatted });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// 4. Ruta za brisanje pojedinačnog proizvoda iz korpe
app.delete('/api/cart/:id', async (req, res) => {
  const idZaBrisanje = req.params.id;
  
  try {
    await dbRun("DELETE FROM cart WHERE productId = $1", [idZaBrisanje]);
    
    const allItems = await dbAll("SELECT * FROM cart");
    const formatted = allItems.map(item => ({ ...item, id: item.productid }));
    res.json({ message: 'Proizvod obrisan iz korpe', korpa: formatted });
  } catch (error) {
    console.error('Greška pri brisanju:', error);
    res.status(500).json({ message: 'Greška pri brisanju.' });
  }
});

// 5. Ruta za kreiranje nove porudžbine (Checkout)
app.post('/api/orders', async (req, res) => {
  const { cart, customerData, paymentMethod, total } = req.body;

  if (!cart || cart.length === 0 || !customerData || !total) {
    return res.status(400).json({ message: 'Nedostaju podaci za porudžbinu.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Početak transakcije

    // 1. Upis u tabelu orders
    const insertOrderQuery = `
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, customer_city, payment_method, total_price, items)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;
    const orderValues = [
      customerData.name,
      customerData.email,
      customerData.phone,
      customerData.address,
      customerData.city,
      paymentMethod,
      total,
      JSON.stringify(cart)
    ];
    const newOrder = await client.query(insertOrderQuery, orderValues);
    console.log(`Kreirana nova porudžbina sa ID: ${newOrder.rows[0].id}`);

    // 2. Pražnjenje korpe
    await client.query('DELETE FROM cart');
    console.log('Korpa ispražnjena nakon kreiranja porudžbine.');

    await client.query('COMMIT'); // Potvrda transakcije
    res.status(201).json({ message: 'Porudžbina je uspešno kreirana!', orderId: newOrder.rows[0].id });
  } catch (error) {
    await client.query('ROLLBACK'); // Poništavanje ako dođe do greške
    console.error('Greška pri kreiranju porudžbine:', error);
    res.status(500).json({ message: 'Došlo je do greške na serveru prilikom kreiranja porudžbine.' });
  } finally {
    client.release();
  }
});

// Ruta za prijavu na newsletter
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  try {
    const existing = await dbGet("SELECT * FROM subscribers WHERE email = $1", [email]);
    if (existing) {
      return res.status(400).json({ message: 'Već ste prijavljeni na našu listu.' });
    }
    await dbRun("INSERT INTO subscribers (email) VALUES ($1)", [email]);
    res.status(200).json({ message: 'Uspešno ste se prijavili!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// Ruta za pregled svih emailova (za admina)
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await dbAll("SELECT * FROM subscribers");
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju pretplatnika.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server je pokrenut i sluša na http://localhost:${PORT}`);
});

// --- INICIJALIZACIJA BAZE ---
async function inicijalizujBazu() {
  try {
    // Tabela Korisnici
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT
    )`);

    // Tabela Proizvodi
    await pool.query(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      price INTEGER,
      image TEXT
    )`);

    // Tabela Korpa
    await pool.query(`CREATE TABLE IF NOT EXISTS cart (
      productId INTEGER,
      name TEXT,
      price INTEGER,
      image TEXT,
      quantity INTEGER,
      totalPrice INTEGER
    )`);

    // Tabela Newsletter
    await pool.query(`CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE
    )`);

    // Tabela za Porudžbine
    await pool.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      items JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    // Popunjavanje proizvoda ako je tabela prazna
    const res = await pool.query("SELECT count(*) as count FROM products");
    if (parseInt(res.rows[0].count) === 0) {
      console.log("Popunjavam bazu sa početnim proizvodima...");
      const insertQuery = "INSERT INTO products (name, price, image) VALUES ($1, $2, $3)";
      await pool.query(insertQuery, ['Suve Šljive', 550, 'https://images.unsplash.com/photo-1595416686568-7965353c2529?auto=format&fit=crop&w=500&q=60']);
      await pool.query(insertQuery, ['Suve Smokve', 800, 'https://images.unsplash.com/photo-1606824960879-592d77977462?auto=format&fit=crop&w=500&q=60']);
      await pool.query(insertQuery, ['Urme', 720, 'https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&w=500&q=60']);
      await pool.query(insertQuery, ['Suvo Grožđe', 480, 'https://images.unsplash.com/photo-1585671720293-c41f74b48621?auto=format&fit=crop&w=500&q=60']);
      await pool.query(insertQuery, ['Suve Kajsije', 950, 'https://images.unsplash.com/photo-1596568673737-272971987570?auto=format&fit=crop&w=500&q=60']);
      await pool.query(insertQuery, ['Brusnica', 1100, 'https://images.unsplash.com/photo-1605557626697-2e87166d88f9?auto=format&fit=crop&w=500&q=60']);
    }
  } catch (err) {
    console.error("Greška pri inicijalizaciji baze:", err);
  }
}
