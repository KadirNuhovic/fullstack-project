// c:\Users\Korisnik\Desktop\Benko Projekat\backend\server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Koristimo SQLite
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- POVEZIVANJE SA BAZOM ---
// Kreira fajl 'baza.db' u istom folderu ako ne postoji
const db = new sqlite3.Database('./baza.db', (err) => {
  if (err) {
    console.error('Greška pri otvaranju baze:', err.message);
  } else {
    console.log('Uspešno povezan sa SQLite bazom (fajl: baza.db).');
    inicijalizujBazu(); // Pravi tabele i ubacuje proizvode
  }
});

// --- POMOĆNE FUNKCIJE (Promise wrapperi za SQLite) ---
// SQLite biblioteka koristi "callback-ove", pa ih pretvaramo u Promise da bi koristili async/await
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// --- RUTE ---

// Ruta za registraciju novog korisnika
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Provera da li korisnik već postoji
    const existingUser = await dbGet("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Korisničko ime već postoji.' });
    }

    // Ubacivanje novog korisnika
    await dbRun("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, password, email]);
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
    const user = await dbGet("SELECT * FROM users WHERE username = ?", [username]);
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
    await dbRun("INSERT INTO products (name, price, image) VALUES (?, ?, ?)", [name, price, image]);
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
    
    // Frontend očekuje 'id' kao ID proizvoda, a u bazi je to 'productId'
    const formatted = cartItems.map(item => ({ ...item, id: item.productId }));
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
    const proizvod = await dbGet("SELECT * FROM products WHERE id = ?", [productId]);
    if (!proizvod) return res.status(404).json({ message: 'Proizvod nije pronađen.' });

    // 2. Proveri da li je već u korpi
    const cartItem = await dbGet("SELECT * FROM cart WHERE productId = ?", [productId]);

    if (cartItem) {
      // Update
      const newQuantity = cartItem.quantity + (quantity || 1);
      const newTotal = newQuantity * cartItem.price;
      await dbRun("UPDATE cart SET quantity = ?, totalPrice = ? WHERE productId = ?", [newQuantity, newTotal, productId]);
    } else {
      // Insert
      const qty = quantity || 1;
      const total = qty * proizvod.price;
      await dbRun(
        "INSERT INTO cart (productId, name, price, image, quantity, totalPrice) VALUES (?, ?, ?, ?, ?, ?)",
        [proizvod.id, proizvod.name, proizvod.price, proizvod.image, qty, total]
      );
    }

    // Vrati novu korpu
    const allItems = await dbAll("SELECT * FROM cart");
    const formatted = allItems.map(item => ({ ...item, id: item.productId }));
    res.status(200).json({ message: 'Proizvod dodat u korpu', korpa: formatted });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// 4. Ruta za brisanje iz korpe
app.delete('/api/cart/:id', async (req, res) => {
  const idZaBrisanje = req.params.id;
  
  try {
    await dbRun("DELETE FROM cart WHERE productId = ?", [idZaBrisanje]);
    
    const allItems = await dbAll("SELECT * FROM cart");
    const formatted = allItems.map(item => ({ ...item, id: item.productId }));
    res.json({ message: 'Proizvod obrisan iz korpe', korpa: formatted });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri brisanju.' });
  }
});

// Ruta za prijavu na newsletter
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  try {
    const existing = await dbGet("SELECT * FROM subscribers WHERE email = ?", [email]);
    if (existing) {
      return res.status(400).json({ message: 'Već ste prijavljeni na našu listu.' });
    }
    await dbRun("INSERT INTO subscribers (email) VALUES (?)", [email]);
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
function inicijalizujBazu() {
  db.serialize(() => {
    // Tabela Korisnici
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT
    )`);

    // Tabela Proizvodi
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price INTEGER,
      image TEXT
    )`);

    // Tabela Korpa
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      productId INTEGER,
      name TEXT,
      price INTEGER,
      image TEXT,
      quantity INTEGER,
      totalPrice INTEGER
    )`);

    // Tabela Newsletter
    db.run(`CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE
    )`);

    // Popunjavanje proizvoda ako je tabela prazna
    db.get("SELECT count(*) as count FROM products", [], (err, row) => {
      if (row && row.count === 0) {
        console.log("Popunjavam bazu sa početnim proizvodima...");
        const stmt = db.prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)");
        stmt.run('Suve Šljive', 550, 'https://images.unsplash.com/photo-1595416686568-7965353c2529?auto=format&fit=crop&w=500&q=60');
        stmt.run('Suve Smokve', 800, 'https://images.unsplash.com/photo-1606824960879-592d77977462?auto=format&fit=crop&w=500&q=60');
        stmt.run('Urme', 720, 'https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&w=500&q=60');
        stmt.run('Suvo Grožđe', 480, 'https://images.unsplash.com/photo-1585671720293-c41f74b48621?auto=format&fit=crop&w=500&q=60');
        stmt.run('Suve Kajsije', 950, 'https://images.unsplash.com/photo-1596568673737-272971987570?auto=format&fit=crop&w=500&q=60');
        stmt.run('Brusnica', 1100, 'https://images.unsplash.com/photo-1605557626697-2e87166d88f9?auto=format&fit=crop&w=500&q=60');
        stmt.finalize();
      }
    });
  });
}
