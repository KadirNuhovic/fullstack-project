const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// Dodajemo root rutu da možeš u browseru da vidiš da li server radi
app.get('/', (req, res) => {
  res.send('Backend server je aktivan! 🚀 Pokušajte /api/products');
});

let pool;
if (process.env.DATABASE_URL) {
  console.log('🌍 Detektovan Render! Povezujem se na online bazu...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
} else {
  console.log('🏠 Detektovan Localhost! Povezujem se na lokalnu bazu...');
  pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'benko_db',
    password: process.env.DB_PASSWORD || 'admin1234',
    port: 5432,
  });
}

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Greška pri povezivanju sa bazom:', err.stack);
  }
  console.log('Uspešno povezan sa PostgreSQL bazom.');
  release();
  inicijalizujBazu();
});

// Prvo pokušaj da učitaš iz Environment varijabli (Render), ako nema, koristi hardkodovano (Localhost)
const EMAIL_USER = process.env.EMAIL_USER || 'nuhovicckadir@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'bsqe bban bcln majd';
const CLEAN_PASS = EMAIL_PASS.replace(/\s+/g, '').trim();

let transporter;
if (EMAIL_USER && CLEAN_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: CLEAN_PASS,
    },
    connectionTimeout: 10000, // Timeout za email (10s)
    socketTimeout: 10000,
  });
  console.log(`✅ Nodemailer transporter je konfigurisan za Gmail: ${EMAIL_USER}`);
  console.log(`🔑 Lozinka učitana. Dužina: ${CLEAN_PASS.length} karaktera (treba da bude 16).`);
} else {
  console.warn('⚠️ UPOZORENJE: EMAIL_USER ili EMAIL_PASS nisu podešeni u .env fajlu. Slanje emailova je onemogućeno.');
  transporter = null;
}

// --- FUNKCIJA ZA KREIRANJE LEPŠEG EMAIL TEMPLEJTA ---
function createEmailTemplate(title, content) {
  return `
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; overflow: hidden;">
              <tr>
                <td align="center" style="background-color: #1a1d23; padding: 20px 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Benko Shop</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin-top: 0;">${title}</h2>
                  ${content}
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color: #f9f9f9; padding: 20px 30px; color: #888888; font-size: 12px; border-top: 1px solid #dddddd;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} Benko Shop. Sva prava zadržana.</p>
                  <p style="margin: 5px 0 0 0;">Ovo je automatski generisana poruka. Molimo ne odgovarajte na nju.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  `;
}

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
  console.log(`📩 Primljen zahtev za login: ${username}`);

  try {
    const user = await dbGet("SELECT * FROM users WHERE username = $1", [username]);
    if (!user) {
      return res.status(400).json({ message: 'Korisnik ne postoji.' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Pogrešna lozinka.' });
    }

    // Generisanje 6-cifrenog koda
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // Kod važi 10 minuta

    // Čuvanje koda u bazu
    await dbRun("UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3", [code, expiresAt, user.id]);

    // Slanje emaila
    if (transporter) {
      try {
        const emailContent = `
          <p>Poštovani/a,</p>
          <p>Hvala što koristite Benko Shop. Vaš verifikacioni kod za prijavu je:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 15px 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p>Ovaj kod ističe za 10 minuta.</p>
          <p>Ako niste Vi zatražili ovaj kod, molimo Vas da ignorišete ovu poruku.</p>
          <br>
          <p>Srdačan pozdrav,<br>Vaš Benko Shop tim</p>
        `;
        await transporter.sendMail({
          from: `"Benko Shop" <${EMAIL_USER}>`,
          to: user.email,
          subject: 'Vaš kod za prijavu',
          html: createEmailTemplate('Vaš kod za prijavu', emailContent)
        });
      } catch (emailError) {
        console.error("Greška pri slanju emaila:", emailError);
        return res.status(500).json({ message: 'Greška pri slanju verifikacionog emaila.' });
      }
    }

    res.json({ message: 'Verifikacioni kod je poslat na vaš email.', requireVerification: true });
  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

app.post('/api/verify', async (req, res) => {
  const { username, code } = req.body;

  try {
    const user = await dbGet("SELECT * FROM users WHERE username = $1", [username]);

    if (!user) {
      return res.status(400).json({ message: 'Korisnik nije pronađen.' });
    }

    if (user.verification_code !== code || new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ message: 'Pogrešan ili istekao verifikacioni kod.' });
    }

    // Uspešna verifikacija - brišemo kod i logujemo korisnika
    await dbRun("UPDATE users SET last_login = CURRENT_TIMESTAMP, verification_code = NULL, verification_expires = NULL WHERE id = $1", [user.id]);

    res.json({ message: 'Uspešna prijava!', username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru prilikom verifikacije.' });
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

    if (transporter) {
      const emailContent = `
        <p>Poštovani/a,</p>
        <p>Zatražili ste resetovanje lozinke za Vaš nalog na Benko Shop-u.</p>
        <p>Vaša nova, privremena lozinka je:</p>
        <div style="font-size: 18px; font-weight: bold; background-color: #f0f0f0; padding: 15px 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          ${newPassword}
        </div>
        <p>Molimo Vas da se prijavite sa ovom lozinkom i odmah je promenite u podešavanjima Vašeg profila.</p>
        <br>
        <p>Srdačan pozdrav,<br>Vaš Benko Shop tim</p>
      `;
      await transporter.sendMail({
        from: `"Benko Shop" <${EMAIL_USER}>`,
        to: email,
        subject: 'Nova lozinka za Benko Shop',
        html: createEmailTemplate('Resetovanje lozinke', emailContent)
      });
    }

    res.json({ message: 'Nova lozinka je poslata na vašu email adresu.' });
  } catch (error) {
    console.error("Greška pri resetovanju lozinke:", error);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// --- ADMIN RUTE ---

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await dbGet("SELECT * FROM users WHERE username = $1", [username]);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Pristup dozvoljen samo administratorima.' });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: 'Pogrešna lozinka.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await dbRun("UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3", [code, expiresAt, user.id]);

    if (transporter) {
      const emailContent = `
        <p>Admin prijava,</p>
        <p>Vaš verifikacioni kod za pristup admin panelu je:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 15px 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          ${code}
        </div>
        <p>Ovaj kod ističe za 10 minuta.</p>
      `;
      await transporter.sendMail({
        from: `"Benko Shop Admin" <${EMAIL_USER}>`,
        to: user.email,
        subject: 'Admin kod za prijavu',
        html: createEmailTemplate('Admin kod za prijavu', emailContent)
      });
    }
    res.json({ message: 'Verifikacioni kod poslat.' });
  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

app.post('/api/admin/verify', async (req, res) => {
  const { username, code } = req.body;
  try {
    const user = await dbGet("SELECT * FROM users WHERE username = $1", [username]);
    if (!user) return res.status(400).json({ message: 'Korisnik nije pronađen.' });

    if (user.verification_code !== code || new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ message: 'Pogrešan ili istekao kod.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await dbRun("UPDATE users SET last_login = CURRENT_TIMESTAMP, verification_code = NULL, verification_expires = NULL, auth_token = $1 WHERE id = $2", [token, user.id]);

    res.json({ message: 'Uspešna prijava!', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// Middleware za proveru admin tokena
const verifyAdminToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // Nema tokena

  try {
    const user = await dbGet("SELECT role FROM users WHERE auth_token = $1", [token]);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.sendStatus(403); // Nije admin
    }
    req.user = user; // Prosledi info o korisniku dalje
    next();
  } catch (error) {
    res.sendStatus(500);
  }
};

// Middleware za proveru superadmina (samo za brisanje)
const verifySuperAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  try {
    const user = await dbGet("SELECT role FROM users WHERE auth_token = $1", [token]);
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Samo superadmin može izvršiti ovu akciju.' });
    }
    next();
  } catch (error) {
    res.sendStatus(500);
  }
};

// --- JAVNE RUTE ---

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

// --- ZAŠTIĆENE RUTE ---

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

    // --- POBOLJŠAN IZGLED EMAILA ZA PORUDŽBINU ---
    const tableStyles = `width: 100%; border-collapse: collapse;`;
    const thStyles = `padding: 12px; background: #f2f2f2; text-align: left; border-bottom: 1px solid #ddd;`;
    const tdStyles = `padding: 12px; border-bottom: 1px solid #ddd;`;

    const itemsHtml = cart.map(item => `
      <tr>
        <td style="${tdStyles}">${item.name}</td>
        <td style="${tdStyles} text-align: center;">${item.quantity}</td>
        <td style="${tdStyles} text-align: right;">${item.price * item.quantity} RSD</td>
      </tr>
    `).join('');

    const orderTime = new Date().toLocaleString('sr-RS');

    const adminMailContent = `
      <p style="text-align: center; color: #777;">Vreme: ${orderTime}</p>
      <p>Stigla je nova porudžbina sa sajta.</p>
      
      <h3 style="border-bottom: 2px solid #61dafb; padding-bottom: 5px;">Podaci o Kupcu</h3>
      <p><strong>Ime:</strong> ${customerData.name}</p>
      <p><strong>Email:</strong> ${customerData.email}</p>
      <p><strong>Telefon:</strong> ${customerData.phone}</p>
      <p><strong>Adresa:</strong> ${customerData.address}, ${customerData.city}, ${customerData.postalCode}</p>
      
      <h3 style="border-bottom: 2px solid #61dafb; padding-bottom: 5px;">Detalji Porudžbine</h3>
      <table style="${tableStyles}">
        <thead>
          <tr>
            <th style="${thStyles}">Proizvod</th>
            <th style="${thStyles} text-align: center;">Količina</th>
            <th style="${thStyles} text-align: right;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <h3 style="text-align: right; margin-top: 20px;">UKUPNO: ${total} RSD</h3>
      <p style="text-align: right;"><strong>Način plaćanja:</strong> ${paymentMethod}</p>
    `;

    if (transporter) {
      transporter.sendMail({
        from: `"Benko Shop" <${EMAIL_USER}>`,
        to: 'nuhovicckadir@gmail.com',
        subject: `🔔 Nova Porudžbina #${newOrder.rows[0].id} od ${customerData.name}`,
        html: createEmailTemplate(`🔔 Nova Porudžbina #${newOrder.rows[0].id}`, adminMailContent)
      })
        .then(() => console.log('✅ ADMIN email o porudžbini poslat.'))
        .catch((err) => console.error('❌ GREŠKA pri slanju ADMIN emaila:', err));
    }

    const customerMailContent = `
      <p>Poštovani/a ${customerData.name},</p>
      <p>Uspešno smo primili Vašu porudžbinu pod brojem <strong>#${newOrder.rows[0].id}</strong>. Uskoro ćemo je obraditi i poslati.</p>
      <p>Vreme porudžbine: ${orderTime}</p>
      
      <h3 style="border-bottom: 2px solid #61dafb; padding-bottom: 5px;">Pregled porudžbine</h3>
      <table style="${tableStyles}">
        <thead>
          <tr>
            <th style="${thStyles}">Proizvod</th>
            <th style="${thStyles} text-align: center;">Količina</th>
            <th style="${thStyles} text-align: right;">Cena</th>
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
    `;

    if (transporter) {
      transporter.sendMail({
        from: `"Benko Shop" <${EMAIL_USER}>`,
        to: customerData.email,
        subject: `Potvrda porudžbine #${newOrder.rows[0].id}`,
        html: createEmailTemplate('Hvala na porudžbini!', customerMailContent)
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

app.get('/api/orders', verifyAdminToken, async (req, res) => {
  try {
    const orders = await dbAll("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju porudžbina.' });
  }
});

app.delete('/api/orders/:id', verifySuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun("DELETE FROM orders WHERE id = $1", [id]);
    res.json({ message: 'Porudžbina obrisana.' });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri brisanju porudžbine.' });
  }
});

app.put('/api/orders/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await dbRun("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: 'Status porudžbine ažuriran.' });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri ažuriranju statusa.' });
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

app.get('/api/users', verifyAdminToken, async (req, res) => {
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

    const emailContent = `
      <p>Dobili ste novu poruku putem kontakt forme na sajtu.</p>
      <br>
      <p><strong>Ime pošiljaoca:</strong> ${name}</p>
      <p><strong>Email pošiljaoca:</strong> <a href="mailto:${email}">${email}</a></p>
      <br>
      <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px;">Tekst poruke:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${message}</div>
    `;

    if (transporter) {
      transporter.sendMail({
        from: `"Benko Shop" <${EMAIL_USER}>`,
        to: 'nuhovicckadir@gmail.com',
        replyTo: email,
        subject: `Nova poruka sa sajta od: ${name}`,
        html: createEmailTemplate(`Nova poruka od: ${name}`, emailContent)
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

app.get('/api/contact', verifyAdminToken, async (req, res) => {
  try {
    const messages = await dbAll("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška pri učitavanju poruka.' });
  }
});

app.delete('/api/contact/:id', verifySuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun("DELETE FROM contact_messages WHERE id = $1", [id]);
    res.json({ message: 'Poruka obrisana.' });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri brisanju poruke.' });
  }
});

app.delete('/api/contact', verifySuperAdmin, async (req, res) => {
  try {
    await dbRun("DELETE FROM contact_messages");
    res.json({ message: 'Sve poruke su obrisane.' });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri brisanju svih poruka.' });
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

app.get('/api/subscribers', verifyAdminToken, async (req, res) => {
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

app.post('/api/categories', verifyAdminToken, async (req, res) => {
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

app.put('/api/products/:id', verifyAdminToken, async (req, res) => {
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

app.delete('/api/products/:id', verifySuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: 'Proizvod obrisan.' });
  } catch (error) {
    console.error("Greška pri brisanju proizvoda:", error);
    res.status(500).json({ message: 'Greška pri brisanju proizvoda.' });
  }
});

app.delete('/api/categories/:id', verifySuperAdmin, async (req, res) => {
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
      email TEXT,
      role TEXT DEFAULT 'user'
    )`);

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE`);
    } catch (err) {
      console.log("Migracija: Provera kolone last_login završena.");
    }

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`);
      console.log("Migracija: Kolona role dodata.");
    } catch (err) {
      console.log("Migracija: Provera kolone role završena.");
    }

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT`);
      console.log("Migracija: Kolona verification_code dodata.");
    } catch (err) {
      console.log("Migracija: Provera kolone verification_code završena.");
    }

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP WITH TIME ZONE`);
      console.log("Migracija: Kolona verification_expires dodata.");
    } catch (err) {
      console.log("Migracija: Provera kolone verification_expires završena.");
    }

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_token TEXT`);
      console.log("Migracija: Kolona auth_token dodata.");
    } catch (err) {
      console.log("Migracija: Provera kolone auth_token završena.");
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Na čekanju'
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
      await pool.query("INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)", ['admin', 'admin', 'nuhovicckadir@gmail.com', 'superadmin']);
    } else if (adminUser.rows[0].role !== 'superadmin' || adminUser.rows[0].email !== 'nuhovicckadir@gmail.com') {
      await pool.query("UPDATE users SET role = 'superadmin', email = 'nuhovicckadir@gmail.com' WHERE username = 'admin'");
      console.log("Ažuriran admin korisnik na 'superadmin' i postavljen email.");
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
