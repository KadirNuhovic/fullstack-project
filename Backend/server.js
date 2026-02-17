// c:\Users\Korisnik\Desktop\Benko Projekat\backend\server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Ovo nam glumi bazu podataka (niz u memoriji)
let poruke = ["Dobrodošao u chat!"];

app.get('/api/data', (req, res) => {
  // Šaljemo sve poruke frontendu
  res.json(poruke);
});

app.post('/api/data', (req, res) => {
  // Uzimamo novu poruku koju je poslao frontend
  const novaPoruka = req.body.poruka;
  console.log("Stigla nova poruka:", novaPoruka);
  poruke.push(novaPoruka); // Dodajemo je u niz
  res.json(poruke); // Vraćamo ažuriranu listu nazad
});

app.listen(PORT, () => {
  console.log(`Backend server je pokrenut i sluša na http://localhost:${PORT}`);
});
