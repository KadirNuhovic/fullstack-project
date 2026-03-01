const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Pokrećem test slanja emaila...');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'TEST: Da li ovo radi?',
  text: 'Ako čitaš ovo, znači da su šifra i email ispravni! 🚀'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('❌ GREŠKA:', error);
  } else {
    console.log('✅ USPEH: Email je poslat! Proveri inbox (i spam).');
    console.log('Info:', info.response);
  }
});