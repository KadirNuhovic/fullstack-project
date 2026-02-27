const nodemailer = require('nodemailer');

console.log('📧 Pokrećem test slanja emaila...');

// 1. KONFIGURACIJA
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nuhovicckadir@gmail.com', // TVOJ EMAIL
    pass: 'jnsp rqok skun qkwy'       // TVOJA APP ŠIFRA (proveri da li je tačna!)
  }
});

// 2. PODACI ZA EMAIL
const mailOptions = {
  from: 'nuhovicckadir@gmail.com',
  to: 'nuhovicckadir@gmail.com', // Šalješ sam sebi
  subject: 'TEST: Da li ovo radi?',
  text: 'Ako čitaš ovo, znači da su šifra i email ispravni! 🚀'
};

// 3. SLANJE
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('❌ GREŠKA:', error);
  } else {
    console.log('✅ USPEH: Email je poslat! Proveri inbox (i spam).');
    console.log('Info:', info.response);
  }
});