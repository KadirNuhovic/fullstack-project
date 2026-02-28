const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Pokrećem test slanja emaila...');

// 1. KONFIGURACIJA
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 2. PODACI ZA EMAIL
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Šalješ sam sebi
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