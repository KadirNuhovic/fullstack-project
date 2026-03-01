const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Resend } = require('resend');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(express.json());

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'benko_db',
      password: process.env.DB_PASSWORD || 'admin1234',
      port: 5432,
    });

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Greška pri povezivanju sa bazom:', err.stack);
  }
  console.log('Uspešno povezan sa PostgreSQL bazom.');
  release();
  inicijalizujBazu();
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await dbGet("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Korisničko ime već postoji.' });
    }

    await dbRun("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", [username, password, email]);
    res.status(201).json({ message: `Korisnik ${username} je uspešno registrovan!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru prilikom registracije.' });
  }
});

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

    await dbRun("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

    res.json({ message: 'Uspešna prijava!', username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await dbGet("SELECT * FROM users WHERE email = $1", [email]);
    if (!user) {
      return res.status(404).json({ message: 'Korisnik sa tom email adresom ne postoji.' });
    }

    const newPassword = Math.random().toString(36).slice(-8);

    await dbRun("UPDATE users SET password = $1 WHERE id = $2", [newPassword, user.id]);

    if (resend) {
      await resend.emails.send({
        from: 'Benko Shop <onboarding@resend.dev>',
        to: email,
        subject: 'Nova lozinka za Benko Shop',
        html: `<p>Vaša nova lozinka je: <strong>${newPassword}</strong></p><p>Molimo vas da je sačuvate.</p>`
      });
    }

    res.json({ message: 'Nova lozinka je poslata na vašu email adresu.' });
  } catch (error) {
    console.error("Greška pri resetovanju lozinke:", error);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, image, category, stock } = req.body;
  try {
    await dbRun("INSERT INTO products (name, price, image, category, stock) VALUES ($1, $2, $3, $4, $5)", [name, price, image, category || 'Ostalo', stock || 0]);
    res.status(201).json({ message: 'Proizvod uspešno dodat!' });
  } catch (error) {
    console.error("Greška pri dodavanju proizvoda:", error);
    res.status(500).json({ message: 'Greška pri dodavanju proizvoda.' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const productsFromDb = await dbAll("SELECT * FROM products");
    res.json(productsFromDb);
  } catch (error) {
    console.error('Greška pri preuzimanju proizvoda:', error);
    res.status(500).json({ message: 'Greška na serveru pri preuzimanju proizvoda.' });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await dbAll("SELECT * FROM cart");
    
    const formatted = cartItems.map(item => ({ ...item, id: item.productid }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri učitavanju korpe.' });
  }
});

app.post('/api/cart', async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    const proizvod = await dbGet("SELECT * FROM products WHERE id = $1", [productId]);
    if (!proizvod) return res.status(404).json({ message: 'Proizvod nije pronađen.' });

    const cartItem = await dbGet("SELECT * FROM cart WHERE productId = $1", [productId]);

    if (cartItem) {
      const newQuantity = cartItem.quantity + (quantity || 1);
      const newTotal = newQuantity * cartItem.price;
      await dbRun("UPDATE cart SET quantity = $1, totalPrice = $2 WHERE productId = $3", [newQuantity, newTotal, productId]);
    } else {
      const qty = quantity || 1;
      const total = qty * proizvod.price;
      await dbRun(
        "INSERT INTO cart (productId, name, price, image, quantity, totalPrice) VALUES ($1, $2, $3, $4, $5, $6)",
        [proizvod.id, proizvod.name, proizvod.price, proizvod.image, qty, total]
      );
    }

    const allItems = await dbAll("SELECT * FROM cart");
    const formatted = allItems.map(item => ({ ...item, id: item.productid }));
    res.status(200).json({ message: 'Proizvod dodat u korpu', korpa: formatted });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

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

app.post('/api/orders', async (req, res) => {
  const { cart, customerData, paymentMethod, total } = req.body;

  if (!cart || cart.length === 0 || !customerData || !total) {
    return res.status(400).json({ message: 'Nedostaju podaci za porudžbinu.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const item of cart) {
      const productStock = await client.query("SELECT name, stock FROM products WHERE id = $1", [item.id]);
      if (!productStock.rows[0] || productStock.rows[0].stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Proizvod "${item.name}" nije dostupan u traženoj količini. Na stanju: ${productStock.rows[0]?.stock || 0}.` });
      }
    }

    for (const item of cart) {
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.id]);
    }
    console.log('Stanje proizvoda ažurirano.');

    const insertOrderQuery = `
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, customer_city, customer_postal_code, payment_method, total_price, items)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;
    const orderValues = [
      customerData.name,
      customerData.email,
      customerData.phone,
      customerData.address,
      customerData.city,
      customerData.postalCode,
      paymentMethod,
      total,
      JSON.stringify(cart)
    ];
    const newOrder = await client.query(insertOrderQuery, orderValues);
    console.log(`Kreirana nova porudžbina sa ID: ${newOrder.rows[0].id}`);

    await client.query('DELETE FROM cart');
    console.log('Korpa ispražnjena nakon kreiranja porudžbine.');

    await client.query('COMMIT');

    res.status(201).json({ message: 'Porudžbina je uspešno kreirana!', orderId: newOrder.rows[0].id });

    const itemsHtml = cart.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price * item.quantity} RSD</td>
      </tr>
    `).join('');

    const orderTime = new Date().toLocaleString('sr-RS');

    const adminMailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #1a1d23; text-align: center;">🔔 Nova Porudžbina #${newOrder.rows[0].id}</h2>
        <p style="text-align: center; color: #777;">Vreme: ${orderTime}</p>
        <p>Stigla je nova porudžbina sa sajta.</p>
        
        <h3 style="border-bottom: 2px solid #61dafb; padding-bottom: 5px;">Podaci o Kupcu</h3>
        <p><strong>Ime:</strong> ${customerData.name}</p>
        <p><strong>Email:</strong> ${customerData.email}</p>
        <p><strong>Telefon:</strong> ${customerData.phone}</p>
        <p><strong>Adresa:</strong> ${customerData.address}, ${customerData.city}, ${customerData.postalCode}</p>
        
        <h3 style="border-bottom: 2px solid #61dafb; padding-bottom: 5px;">Detalji Porudžbine</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; background: #f2f2f2; text-align: left;">Proizvod</th>
              <th style="padding: 10px; background: #f2f2f2; text-align: center;">Količina</th>
              <th style="padding: 10px; background: #f2f2f2; text-align: right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <h3 style="text-align: right; margin-top: 20px;">UKUPNO: ${total} RSD</h3>
        <p style="text-align: right;"><strong>Način plaćanja:</strong> ${paymentMethod}</p>
      </div>
    `;

    if (resend) {
      resend.emails.send({
        from: 'Benko Shop <onboarding@resend.dev>',
        to: 'nuhovicckadir@gmail.com',
        subject: `🔔 Nova Porudžbina #${newOrder.rows[0].id} od ${customerData.name}`,
        html: adminMailHtml
      })
        .then(() => console.log('✅ ADMIN email o porudžbini poslat.'))
        .catch((err) => console.error('❌ GREŠKA pri slanju ADMIN emaila:', err));
    }

    const customerMailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #1a1d23; text-align: center;">Hvala na porudžbini!</h2>
        <p>Poštovani/a ${customerData.name},</p>
        <p>Uspešno smo primili Vašu porudžbinu pod brojem <strong>#${newOrder.rows[0].id}</strong>. Uskoro ćemo je obraditi i poslati.</p>
        <p>Vreme porudžbine: ${orderTime}</p>
        
        <h3 style="border-bottom: 2px solid #61dafb; padding-bottom: 5px;">Pregled porudžbine</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; background: #f2f2f2; text-align: left;">Proizvod</th>
              <th style="padding: 10px; background: #f2f2f2; text-align: center;">Količina</th>
              <th style="padding: 10px; background: #f2f2f2; text-align: right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <h3 style="text-align: right; margin-top: 20px;">UKUPNO: ${total} RSD</h3>
        <p style="text-align: right;"><strong>Način plaćanja:</strong> ${paymentMethod}</p>
        <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 0.9em; color: #777; text-align: center;">Ukoliko imate bilo kakvih pitanja, slobodno nas kontaktirajte.</p>
        <p style="font-size: 0.9em; color: #777; text-align: center;">Vaš Benko Shop</p>
      </div>
    `;

    if (resend) {
      resend.emails.send({
        from: 'Benko Shop <onboarding@resend.dev>',
        to: customerData.email,
        subject: `Potvrda porudžbine #${newOrder.rows[0].id}`,
        html: customerMailHtml
      })
        .then(() => console.log('✅ KUPAC email o porudžbini poslat.'))
        .catch((err) => console.error('❌ GREŠKA pri slanju emaila KUPCU:', err));
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Greška pri kreiranju porudžbine:', error);
    res.status(500).json({ message: 'Došlo je do greške na serveru prilikom kreiranja porudžbine.' });
  } finally {
    client.release();
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await dbAll("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju porudžbina.' });
  }
});

app.get('/api/my-orders/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const user = await dbGet("SELECT email FROM users WHERE username = $1", [username]);
    
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }

    const orders = await dbAll("SELECT * FROM orders WHERE customer_email = $1 ORDER BY created_at DESC", [user.email]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju istorije porudžbina.' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll("SELECT id, username, email, last_login FROM users ORDER BY id DESC");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju korisnika.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Sva polja su obavezna.' });
  }

  try {
    await dbRun(
      "INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );

    const mailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #1a1d23;">Nova poruka sa sajta</h2>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr>
        <p><strong>Poruka:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
      </div>
    `;

    if (resend) {
      resend.emails.send({
        from: 'Benko Shop <onboarding@resend.dev>',
        to: 'nuhovicckadir@gmail.com',
        reply_to: email,
        subject: `Nova poruka sa sajta od: ${name}`,
        html: mailHtml
      })
        .then(() => console.log('✅ KONTAKT EMAIL POSLAT'))
        .catch((err) => console.error('❌ GREŠKA PRI SLANJU KONTAKT EMAILA:', err));
    }

    res.status(200).json({ message: 'Poruka uspešno poslata!' });

  } catch (error) {
    console.error('Greška pri čuvanju kontakt poruke:', error);
    res.status(500).json({ message: 'Došlo je do greške na serveru.' });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const messages = await dbAll("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju poruka.' });
  }
});

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

app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await dbAll("SELECT * FROM subscribers");
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju pretplatnika.' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAll("SELECT * FROM categories ORDER BY name");
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju kategorija.' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Naziv kategorije je obavezan.' });
  try {
    await dbRun("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.status(201).json({ message: 'Kategorija uspešno dodata.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri dodavanju kategorije.' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const price = parseInt(req.body.price, 10) || 0;
  const stock = parseInt(req.body.stock, 10) || 0;
  const { name, category } = req.body;

  try {
    const result = await dbRun(
      "UPDATE products SET name = $1, price = $2, stock = $3, category = $4 WHERE id = $5 RETURNING *",
      [name, price, stock, category, id]
    );
    res.json({ message: 'Proizvod uspešno ažuriran.', product: result.rows[0] });
  } catch (error) {
    console.error("Greška pri ažuriranju proizvoda:", error);
    res.status(500).json({ message: 'Greška pri ažuriranju proizvoda.' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await dbRun("DELETE FROM categories WHERE id = $1", [id]);
    res.json({ message: 'Kategorija obrisana.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri brisanju kategorije.' });
  }
});

app.get('/api/products/:id/reviews', async (req, res) => {
  const productId = req.params.id;
  try {
    const reviews = await dbAll("SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC", [productId]);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju recenzija.' });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  const productId = req.params.id;
  const { username, rating, text } = req.body;
  
  if (!username || !rating || !text) {
    return res.status(400).json({ message: 'Svi podaci su obavezni.' });
  }

  try {
    await dbRun(
      "INSERT INTO reviews (product_id, username, rating, text) VALUES ($1, $2, $3, $4)",
      [productId, username, rating, text]
    );
    res.status(201).json({ message: 'Recenzija uspešno dodata.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri dodavanju recenzije.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server je pokrenut i sluša na http://localhost:${PORT}`);
});

async function inicijalizujBazu() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT
    )`);

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE`);
    } catch (err) {
      console.log("Migracija: Provera kolone last_login završena.");
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      price INTEGER,
      image TEXT,
      category TEXT DEFAULT 'Ostalo',
      stock INTEGER DEFAULT 0
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS cart (
      productId INTEGER,
      name TEXT,
      price INTEGER,
      image TEXT,
      quantity INTEGER,
      totalPrice INTEGER
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city TEXT NOT NULL,
      customer_postal_code TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      items JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER,
      username TEXT,
      rating INTEGER,
      text TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_postal_code TEXT NOT NULL DEFAULT ''`);
    } catch (err) {
      console.log("Migracija: Provera kolone customer_postal_code završena.");
    }

    try {
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Ostalo'`);
      console.log("Migracija: Kolona 'category' je proverena/dodata.");
    } catch (err) {
      console.log("Migracija: Provera kolone category završena.");
    }

    try {
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0`);
      console.log("Migracija: Kolona 'stock' je proverena/dodata.");
    } catch (err) {
      console.log("Migracija: Provera kolone stock završena.");
    }

    const adminUser = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (adminUser.rows.length === 0) {
      console.log("Kreiram podrazumevanog admin korisnika (user: admin, pass: admin)...");
      await pool.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", ['admin', 'admin', 'admin@benko.com']);
    }

    const res = await pool.query("SELECT count(*) as count FROM products");
    if (parseInt(res.rows[0].count) === 0) {
      console.log("Popunjavam bazu sa početnim proizvodima...");
      const insertQuery = "INSERT INTO products (name, price, image, category, stock) VALUES ($1, $2, $3, $4, $5)";
      await pool.query(insertQuery, ['Suve Šljive', 550, 'https://images.unsplash.com/photo-1595416686568-7965353c2529?auto=format&fit=crop&w=500&q=60', 'Domaće', 50]);
      await pool.query(insertQuery, ['Suve Smokve', 800, 'https://images.unsplash.com/photo-1606824960879-592d77977462?auto=format&fit=crop&w=500&q=60', 'Domaće', 30]);
      await pool.query(insertQuery, ['Urme', 720, 'https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&w=500&q=60', 'Egzotično', 40]);
      await pool.query(insertQuery, ['Suvo Grožđe', 480, 'https://images.unsplash.com/photo-1585671720293-c41f74b48621?auto=format&fit=crop&w=500&q=60', 'Domaće', 100]);
      await pool.query(insertQuery, ['Suve Kajsije', 950, 'https://images.unsplash.com/photo-1596568673737-272971987570?auto=format&fit=crop&w=500&q=60', 'Domaće', 25]);
      await pool.query(insertQuery, ['Brusnica', 1100, 'https://images.unsplash.com/photo-1605557626697-2e87166d88f9?auto=format&fit=crop&w=500&q=60', 'Egzotično', 60]);
    }

    const catRes = await pool.query("SELECT count(*) as count FROM categories");
    if (parseInt(catRes.rows[0].count) === 0) {
      console.log("Popunjavam bazu sa početnim kategorijama...");
      await pool.query("INSERT INTO categories (name) VALUES ($1), ($2), ($3)", ['Domaće', 'Egzotično', 'Orašasti plodovi']);
    }
  } catch (err) {
    console.error("Greška pri inicijalizaciji baze:", err);
  }
}
