// c:\Users\Korisnik\Desktop\Benko Projekat\backend\server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- BAZA PODATAKA U MEMORIJI ---
let proizvodi = [
  { id: 1, naziv: 'Suve Šljive', cena: '550 RSD/kg' },
  { id: 2, naziv: 'Suve Smokve', cena: '800 RSD/kg' },
];
let korisnici = []; // Niz za čuvanje registrovanih korisnika

// --- RUTE ---

// Ruta za registraciju novog korisnika
app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body;

  // Jednostavna provera da li korisnik već postoji
  if (korisnici.find(k => k.username === username)) {
    return res.status(400).json({ message: 'Korisničko ime već postoji.' });
  }

  const noviKorisnik = { id: Date.now(), username, password, email };
  korisnici.push(noviKorisnik);
  console.log('Novi korisnik registrovan:', noviKorisnik);
  console.log('Svi korisnici:', korisnici);
  res.status(201).json({ message: `Korisnik ${username} je uspešno registrovan!` });
});

app.listen(PORT, () => {
  console.log(`Backend server je pokrenut i sluša na http://localhost:${PORT}`);
});
