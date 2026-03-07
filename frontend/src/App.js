import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import HeroSection from './HeroSection';
import InfoSection from './InfoSection';
import AuthModal from './AuthModal';
import ProductDetail from './ProductDetail';
import SubscribersList from './SubscribersList';
import ProductList from './ProductList';
import About from './About';
import Contact from './Contact';
import AdminPanel from './AdminPanel';
import Checkout from './Checkout';
import CartPage from './CartPage';
import UserProfile from './UserProfile';
import './App.css';

// Koristimo environment varijablu. Ako nije definisana, fallback je localhost.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const translations = {
  'sr-lat': {
    header: {
      home: 'Početna',
      products: 'Proizvodi',
      about: 'O nama',
      contact: 'Kontakt',
      searchPlaceholder: 'Pretražite proizvode...',
      login: 'Prijavi se',
      logout: 'Odjavi se',
    },
    hero: { titlePrefix: 'Dobrodošli u svet', titleHighlight: 'Suvog Voća', subtitle: 'Najzdraviji slatkiši iz prirode, pažljivo birani za vas. Otkrijte našu ponudu najkvalitetnijeg sušenog voća.', cta: 'Pogledaj Ponudu' },
    info: { title: 'Put od Voćnjaka do Vas', card1Title: 'Domaća Berba', card1Text: 'Naše voće dolazi iz srca Šumadije, gde se pažljivo bira svaki plod.', card2Title: 'Prirodno Sušenje', card2Text: 'Koristimo proces sporog sušenja na niskim temperaturama.', card3Title: 'Kvalitet i Sigurnost', card3Text: 'Svako pakovanje prolazi strogu kontrolu kvaliteta.' },
    newsletter: { title: 'Ostanite u toku', text: 'Prijavite se na naš newsletter i prvi saznajte za akcije.', placeholder: 'Vaša email adresa', btn: 'Prijavi se', successTitle: 'Hvala na prijavi! 🎉', successText: 'Očekujte sjajne recepte i popuste.' },
    footer: { text: 'Najbolje sušeno voće iz prirode, direktno do vas.', quickLinks: 'Brzi Linkovi', followUs: 'Pratite Nas', rights: 'Sva prava zadržana.' },
    auth: { welcomeBack: 'Dobrodošli nazad', createAccount: 'Napravi nalog', username: 'Korisničko ime', password: 'Lozinka', email: 'Email adresa', loginBtn: 'Prijavi se', registerBtn: 'Registruj se', noAccount: 'Nemaš nalog?', registerHere: 'Registruj se ovde', hasAccount: 'Već imaš nalog?', loginHere: 'Prijavi se' },
    productDetail: { back: 'Nazad na ponudu', addToCart: 'DODAJ U KORPU', reviews: 'Recenzije i Komentari', writeReview: 'Napišite vaš utisak...', sendReview: 'Pošalji komentar', loginToReview: 'Prijavite se da biste ostavili recenziju.' },
    cartSidebar: { title: 'Tvoja Korpa', empty: 'Korpa je prazna.', total: 'Ukupno:', checkoutBtn: 'Idi na plaćanje' },
    about: {
      title: 'Naša Priča, Vaše',
      titleHighlight: 'Zdravlje',
      subtitle: 'Saznajte više o našoj posvećenosti kvalitetu i prirodnim sastojcima.',
      missionTitle: 'Naša Misija',
      missionText: 'Naša misija je da pružimo najkvalitetnije suvo voće, direktno od prirode do vašeg stola, promovišući zdrav život i autentične ukuse.',
      qualityTitle: 'Standard Kvaliteta',
      qualityText: 'Svaki plod prolazi strogu kontrolu kvaliteta kako bismo osigurali da dobijate samo najbolje. Bez aditiva, bez kompromisa.',
      partnerTitle: 'Partner Vašeg Zdravlja',
      partnerText: 'Mi nismo samo prodavci. Mi smo vaši partneri u očuvanju zdravlja, nudeći proizvode koji hrane i telo i duh.',
      stat1: 'Prirodni Proizvodi',
      stat2: 'Vrsta Proizvoda',
      stat3: 'Zadovoljnih Kupaca',
    },
    contact: {
      title: 'Stupite u',
      titleHighlight: 'Kontakt',
      subtitle: 'Imate pitanje, predlog ili samo želite da se javite? Tu smo za vas.',
      location: 'Lokacija',
      phone: 'Telefon',
      email: 'Email',
      workingHours: 'Radno Vreme',
      name: 'Ime i prezime',
      email: 'Email adresa',
      formTitle: 'Pošaljite nam poruku',
      msgPlaceholder: 'Vaša poruka',
      sending: 'Slanje...',
      sendBtn: 'Pošalji Poruku',
    },
    cart: {
        title: 'Vaša Korpa',
        emptyTitle: 'Vaša korpa je prazna',
        emptyText: 'Pregledajte našu ponudu i dodajte nešto u korpu.',
        backBtn: 'Nazad na proizvode',
        product: 'Proizvod',
        price: 'Cena',
        quantity: 'Količina',
        total: 'Ukupno',
        remove: 'Ukloni',
        totalPay: 'Ukupno za plaćanje',
        continue: 'Nastavi kupovinu',
        checkout: 'Završi kupovinu',
    },
    checkout: {
        title: 'Završetak Kupovine',
        subtitle: 'Molimo vas unesite vaše podatke kako biste završili porudžbinu.',
        customerInfo: 'Podaci o kupcu',
        name: 'Ime i prezime',
        email: 'Email adresa',
        phone: 'Broj telefona',
        deliveryInfo: 'Podaci za dostavu',
        address: 'Adresa i broj',
        city: 'Grad',
        postalCode: 'Poštanski broj',
        paymentMethod: 'Način plaćanja',
        cashOnDelivery: 'Plaćanje pouzećem',
        cardPayment: 'Plaćanje karticom (uskoro)',
        orderSummary: 'Pregled porudžbine',
        shipping: 'Dostava',
        free: 'Besplatna',
        placeOrder: 'Naruči',
        processing: 'Obrađuje se...',
        successTitle: 'Porudžbina uspešna!',
        successRedirect: 'Bićete preusmereni na početnu stranicu.',
        errorName: 'Ime je obavezno.',
        errorEmail: 'Unesite ispravan email.',
        errorPhone: 'Telefon je obavezan.',
        errorAddress: 'Adresa je obavezna.',
        errorCity: 'Grad je obavezan.',
        errorPostalCode: 'Poštanski broj je obavezan.',
        errorFillAll: 'Molimo popunite sva obavezna polja.',
        errorServer: 'Došlo je do greške na serveru. Molimo pokušajte kasnije.',
    },
  },
  'sr-cyr': {
    header: {
        home: 'Почетна',
        products: 'Производи',
        about: 'О нама',
        contact: 'Контакт',
        searchPlaceholder: 'Претражите производе...',
        login: 'Пријави се',
        logout: 'Одјави се',
    },
    hero: { titlePrefix: 'Добродошли у свет', titleHighlight: 'Сувог Воћа', subtitle: 'Најздравији слаткиши из природе, пажљиво бирани за вас. Откријте нашу понуду најквалитетнијег сушеног воћа.', cta: 'Погледај Понуду' },
    info: { title: 'Пут од Воћњака до Вас', card1Title: 'Домаћа Берба', card1Text: 'Наше воће долази из срца Шумадије, где се пажљиво бира сваки плод.', card2Title: 'Природно Сушење', card2Text: 'Користимо процес спорог сушења на ниским температурама.', card3Title: 'Квалитет и Сигурност', card3Text: 'Свако паковање пролази строгу контролу квалитета.' },
    newsletter: { title: 'Останите у току', text: 'Пријавите се на наш неwслеттер и први сазнајте за акције.', placeholder: 'Ваша емаил адреса', btn: 'Пријави се', successTitle: 'Хвала на пријави! 🎉', successText: 'Очекујте сјајне рецепте и попусте.' },
    footer: { text: 'Најбоље сушено воће из природе, директно до вас.', quickLinks: 'Брзи Линкови', followUs: 'Пратите Нас', rights: 'Сва права задржана.' },
    auth: { welcomeBack: 'Добродошли назад', createAccount: 'Направи налог', username: 'Корисничко име', password: 'Лозинка', email: 'Емаил адреса', loginBtn: 'Пријави се', registerBtn: 'Региструј се', noAccount: 'Немаш налог?', registerHere: 'Региструј се овде', hasAccount: 'Већ имаш налог?', loginHere: 'Пријави се' },
    productDetail: { back: 'Назад на понуду', addToCart: 'ДОДАЈ У КОРПУ', reviews: 'Рецензије и Коментари', writeReview: 'Напишите ваш утисак...', sendReview: 'Пошаљи коментар', loginToReview: 'Пријавите се да бисте оставили рецензију.' },
    cartSidebar: { title: 'Твоја Корпа', empty: 'Корпа је празна.', total: 'Укупно:', checkoutBtn: 'Иди на плаћање' },
    about: {
        title: 'Наша Прича, Ваше',
        titleHighlight: 'Здравље',
        subtitle: 'Сазнајте више о нашој посвећености квалитету и природним састојцима.',
        missionTitle: 'Наша Мисија',
        missionText: 'Наша мисија је да пружимо најквалитетније суво воће, директно од природе до вашег стола, промовишући здрав живот и аутентичне укусе.',
        qualityTitle: 'Стандард Квалитета',
        qualityText: 'Сваки плод пролази строгу контролу квалитета како бисмо осигурали да добијате само најбоље. Без адитива, без компромиса.',
        partnerTitle: 'Партнер Вашег Здравља',
        partnerText: 'Ми нисмо само продавци. Ми смо ваши партнери у очувању здравља, нудећи производе који хране и тело и дух.',
        stat1: 'Природни Производи',
        stat2: 'Врста Производа',
        stat3: 'Задовољних Купаца',
    },
    contact: {
        title: 'Ступите у',
        titleHighlight: 'Контакт',
        subtitle: 'Имате питање, предлог или само желите да се јавите? Ту смо за вас.',
        location: 'Локација',
        phone: 'Телефон',
        email: 'Емаил',
        workingHours: 'Радно Време',
        name: 'Име и презиме',
        email: 'Емаил адреса',
        formTitle: 'Пошаљите нам поруку',
        msgPlaceholder: 'Ваша порука',
        sending: 'Слање...',
        sendBtn: 'Пошаљи Поруку',
    },
    cart: {
        title: 'Ваша Корпа',
        emptyTitle: 'Ваша корпа је празна',
        emptyText: 'Прегледајте нашу понуду и додајте нешто у корпу.',
        backBtn: 'Назад на производе',
        product: 'Производ',
        price: 'Цена',
        quantity: 'Количина',
        total: 'Укупно',
        remove: 'Уклони',
        totalPay: 'Укупно за плаћање',
        continue: 'Настави куповину',
        checkout: 'Заврши куповину',
    },
    checkout: {
        title: 'Завршетак Куповине',
        subtitle: 'Молимо вас унесите ваше податке како бисте завршили поруџбину.',
        customerInfo: 'Подаци о купцу',
        name: 'Име и презиме',
        email: 'Емаил адреса',
        phone: 'Број телефона',
        deliveryInfo: 'Подаци за доставу',
        address: 'Адреса и број',
        city: 'Град',
        postalCode: 'Поштански број',
        paymentMethod: 'Начин плаћања',
        cashOnDelivery: 'Плаћање поузећем',
        cardPayment: 'Плаћање картицом (ускоро)',
        orderSummary: 'Преглед поруџбине',
        shipping: 'Достава',
        free: 'Бесплатна',
        placeOrder: 'Наручи',
        processing: 'Обрађује се...',
        successTitle: 'Поруџбина успешна!',
        successRedirect: 'Бићете преусмерени на почетну страницу.',
        errorName: 'Име је обавезно.',
        errorEmail: 'Унесите исправан емаил.',
        errorPhone: 'Телефон је обавезан.',
        errorAddress: 'Адреса је обавезна.',
        errorCity: 'Град је обавезан.',
        errorPostalCode: 'Поштански број је обавезан.',
        errorFillAll: 'Молимо попуните сва обавезна поља.',
        errorServer: 'Дошло је до грешке на серверу. Молимо покушајте касније.',
    },
  },
  'en': {
    header: {
        home: 'Home',
        products: 'Products',
        about: 'About Us',
        contact: 'Contact',
        searchPlaceholder: 'Search products...',
        login: 'Sign In',
        logout: 'Logout',
    },
    hero: { titlePrefix: 'Welcome to the world of', titleHighlight: 'Dried Fruits', subtitle: 'The healthiest sweets from nature, carefully selected for you.', cta: 'View Offer' },
    info: { title: 'From Orchard to You', card1Title: 'Domestic Harvest', card1Text: 'Our fruit comes from the heart of Šumadija.', card2Title: 'Natural Drying', card2Text: 'We use a slow drying process at low temperatures.', card3Title: 'Quality & Safety', card3Text: 'Every package passes strict quality control.' },
    newsletter: { title: 'Stay Updated', text: 'Subscribe to our newsletter for news and discounts.', placeholder: 'Your email address', btn: 'Subscribe', successTitle: 'Thanks for subscribing! 🎉', successText: 'Expect great recipes and discounts.' },
    footer: { text: 'The best dried fruit from nature, directly to you.', quickLinks: 'Quick Links', followUs: 'Follow Us', rights: 'All rights reserved.' },
    auth: { welcomeBack: 'Welcome Back', createAccount: 'Create Account', username: 'Username', password: 'Password', email: 'Email Address', loginBtn: 'Sign In', registerBtn: 'Sign Up', noAccount: 'No account?', registerHere: 'Sign up here', hasAccount: 'Already have an account?', loginHere: 'Sign in' },
    productDetail: { back: 'Back to Offer', addToCart: 'ADD TO CART', reviews: 'Reviews', writeReview: 'Write your review...', sendReview: 'Submit Review', loginToReview: 'Please login to leave a review.' },
    cartSidebar: { title: 'Your Cart', empty: 'Cart is empty.', total: 'Total:', checkoutBtn: 'Go to Checkout' },
    about: {
        title: 'Our Story, Your',
        titleHighlight: 'Health',
        subtitle: 'Learn more about our commitment to quality and natural ingredients.',
        missionTitle: 'Our Mission',
        missionText: 'Our mission is to provide the highest quality dried fruit, directly from nature to your table, promoting a healthy life and authentic tastes.',
        qualityTitle: 'Quality Standard',
        qualityText: 'Every fruit undergoes strict quality control to ensure you get only the best. No additives, no compromises.',
        partnerTitle: 'Your Health Partner',
        partnerText: 'We are not just sellers. We are your partners in maintaining health, offering products that nourish both body and spirit.',
        stat1: 'Natural Products',
        stat2: 'Product Types',
        stat3: 'Satisfied Customers',
    },
    contact: {
        title: 'Get in',
        titleHighlight: 'Touch',
        subtitle: 'Have a question, a suggestion, or just want to say hello? We are here for you.',
        location: 'Location',
        phone: 'Phone',
        email: 'Email',
        workingHours: 'Working Hours',
        name: 'Full Name',
        email: 'Email Address',
        formTitle: 'Send us a message',
        msgPlaceholder: 'Your message',
        sending: 'Sending...',
        sendBtn: 'Send Message',
    },
    cart: {
        title: 'Your Cart',
        emptyTitle: 'Your cart is empty',
        emptyText: 'Browse our offer and add something to your cart.',
        backBtn: 'Back to products',
        product: 'Product',
        price: 'Price',
        quantity: 'Quantity',
        total: 'Total',
        remove: 'Remove',
        totalPay: 'Total to pay',
        continue: 'Continue shopping',
        checkout: 'Checkout',
    },
    checkout: {
        title: 'Checkout',
        subtitle: 'Please enter your details to complete the order.',
        customerInfo: 'Customer Information',
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        deliveryInfo: 'Delivery Information',
        address: 'Address & Number',
        city: 'City',
        postalCode: 'Postal Code',
        paymentMethod: 'Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        cardPayment: 'Card Payment (soon)',
        orderSummary: 'Order Summary',
        shipping: 'Shipping',
        free: 'Free',
        placeOrder: 'Place Order',
        processing: 'Processing...',
        successTitle: 'Order Successful!',
        successRedirect: 'You will be redirected to the homepage.',
        errorName: 'Name is required.',
        errorEmail: 'Enter a valid email.',
        errorPhone: 'Phone is required.',
        errorAddress: 'Address is required.',
        errorCity: 'City is required.',
        errorPostalCode: 'Postal code is required.',
        errorFillAll: 'Please fill in all required fields.',
        errorServer: 'A server error occurred. Please try again later.',
    },
  },
  'hr': {
    header: {
        home: 'Početna',
        products: 'Proizvodi',
        about: 'O nama',
        contact: 'Kontakt',
        searchPlaceholder: 'Pretražite proizvode...',
        login: 'Prijavi se',
        logout: 'Odjavi se',
    },
    hero: { titlePrefix: 'Dobrodošli u svijet', titleHighlight: 'Suhog Voća', subtitle: 'Najzdraviji slatkiši iz prirode, pažljivo birani za vas.', cta: 'Pogledaj Ponudu' },
    info: { title: 'Put od Voćnjaka do Vas', card1Title: 'Domaća Berba', card1Text: 'Naše voće dolazi iz srca Šumadije.', card2Title: 'Prirodno Sušenje', card2Text: 'Koristimo proces sporog sušenja na niskim temperaturama.', card3Title: 'Kvaliteta i Sigurnost', card3Text: 'Svako pakiranje prolazi strogu kontrolu kvalitete.' },
    newsletter: { title: 'Ostanite u tijeku', text: 'Prijavite se na naš newsletter.', placeholder: 'Vaša email adresa', btn: 'Prijavi se', successTitle: 'Hvala na prijavi! 🎉', successText: 'Očekujte sjajne recepte i popuste.' },
    footer: { text: 'Najbolje suho voće iz prirode, direktno do vas.', quickLinks: 'Brzi Linkovi', followUs: 'Pratite Nas', rights: 'Sva prava pridržana.' },
    auth: { welcomeBack: 'Dobrodošli natrag', createAccount: 'Napravi račun', username: 'Korisničko ime', password: 'Lozinka', email: 'Email adresa', loginBtn: 'Prijavi se', registerBtn: 'Registriraj se', noAccount: 'Nemaš račun?', registerHere: 'Registriraj se ovdje', hasAccount: 'Već imaš račun?', loginHere: 'Prijavi se' },
    productDetail: { back: 'Natrag na ponudu', addToCart: 'DODAJ U KOŠARICU', reviews: 'Recenzije i Komentari', writeReview: 'Napišite vaš dojam...', sendReview: 'Pošalji komentar', loginToReview: 'Prijavite se kako biste ostavili recenziju.' },
    cartSidebar: { title: 'Tvoja Košarica', empty: 'Košarica je prazna.', total: 'Ukupno:', checkoutBtn: 'Idi na plaćanje' },
    about: {
        title: 'Naša Priča, Vaše',
        titleHighlight: 'Zdravlje',
        subtitle: 'Saznajte više o našoj posvećenosti kvaliteti i prirodnim sastojcima.',
        missionTitle: 'Naša Misija',
        missionText: 'Naša misija je pružiti najkvalitetnije suho voće, izravno iz prirode do vašeg stola, promovirajući zdrav život i autentične okuse.',
        qualityTitle: 'Standard Kvalitete',
        qualityText: 'Svaki plod prolazi strogu kontrolu kvalitete kako bismo osigurali da dobivate samo najbolje. Bez aditiva, bez kompromisa.',
        partnerTitle: 'Partner Vašeg Zdravlja',
        partnerText: 'Mi nismo samo prodavači. Mi smo vaši partneri u očuvanju zdravlja, nudeći proizvode koji hrane i tijelo i duh.',
        stat1: 'Prirodni Proizvodi',
        stat2: 'Vrsta Proizvoda',
        stat3: 'Zadovoljnih Kupaca',
    },
    contact: {
        title: 'Stupite u',
        titleHighlight: 'Kontakt',
        subtitle: 'Imate pitanje, prijedlog ili samo želite se javiti? Tu smo za vas.',
        location: 'Lokacija',
        phone: 'Telefon',
        email: 'Email',
        workingHours: 'Radno Vrijeme',
        name: 'Ime i prezime',
        email: 'Email adresa',
        formTitle: 'Pošaljite nam poruku',
        msgPlaceholder: 'Vaša poruka',
        sending: 'Slanje...',
        sendBtn: 'Pošalji Poruku',
    },
    cart: {
        title: 'Vaša Košarica',
        emptyTitle: 'Vaša košarica je prazna',
        emptyText: 'Pregledajte našu ponudu i dodajte nešto u košaricu.',
        backBtn: 'Natrag na proizvode',
        product: 'Proizvod',
        price: 'Cijena',
        quantity: 'Količina',
        total: 'Ukupno',
        remove: 'Ukloni',
        totalPay: 'Ukupno za platiti',
        continue: 'Nastavi kupovinu',
        checkout: 'Završi kupnju',
    },
    checkout: {
        title: 'Završetak Kupnje',
        subtitle: 'Molimo vas unesite vaše podatke kako biste završili narudžbu.',
        customerInfo: 'Podaci o kupcu',
        name: 'Ime i prezime',
        email: 'Email adresa',
        phone: 'Broj telefona',
        deliveryInfo: 'Podaci za dostavu',
        address: 'Adresa i broj',
        city: 'Grad',
        postalCode: 'Poštanski broj',
        paymentMethod: 'Način plaćanja',
        cashOnDelivery: 'Plaćanje pouzećem',
        cardPayment: 'Plaćanje karticom (uskoro)',
        orderSummary: 'Pregled narudžbe',
        shipping: 'Dostava',
        free: 'Besplatna',
        placeOrder: 'Naruči',
        processing: 'Obrađuje se...',
        successTitle: 'Narudžba uspješna!',
        successRedirect: 'Bit ćete preusmjereni na početnu stranicu.',
        errorName: 'Ime je obavezno.',
        errorEmail: 'Unesite ispravan email.',
        errorPhone: 'Telefon je obavezan.',
        errorAddress: 'Adresa je obavezna.',
        errorCity: 'Grad je obavezan.',
        errorPostalCode: 'Poštanski broj je obavezan.',
        errorFillAll: 'Molimo popunite sva obavezna polja.',
        errorServer: 'Došlo je do pogreške na poslužitelju. Molimo pokušajte kasnije.',
    },
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [serverError, setServerError] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [language, setLanguage] = useState('sr-lat');

  const [searchTerm, setSearchTerm] = useState('');
  const [rezultati, setRezultati] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  
  const [selectedCategory, setSelectedCategory] = useState('Sve');
  const [sortOrder, setSortOrder] = useState('default');

  const [selectedProduct, setSelectedProduct] = useState(null);

  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setServerError(null);
        const productsRes = await fetch(`${API_URL}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);
        setRezultati(productsData);

        const catRes = await fetch(`${API_URL}/categories`);
        const catData = await catRes.json();
        setCategories(catData);
        const cartRes = await fetch(`${API_URL}/cart`);
        const cartData = await cartRes.json();
        setCart(cartData);
      } catch (error) {
        console.error("Greška pri učitavanju podataka:", error);
        setServerError("Nije moguće povezati se sa serverom. Proveri da li je 'node server.js' pokrenut.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/admin') || hash.includes('admin')) {
        setActivePage('admin');
      }
    }
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm !== '') {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedCategory !== 'Sve') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setRezultati(filtered);
  }, [searchTerm, products, selectedCategory, sortOrder]);

  const handleSignIn = () => {
    setShowAuthModal(true);
    setAuthMode('signin');
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddToCart = async (productId, quantity) => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.korpa);
      } else {
        console.error("Greška pri dodavanju u korpu:", data.message);
      }
    } catch (error) {
      console.error("Greška na serveru:", error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.korpa);
      } else {
        console.error("Greška pri brisanju iz korpe:", data.message);
      }
    } catch (error) {
      console.error("Greška na serveru:", error);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.korpa);
      } else {
        console.error("Greška pri ažuriranju količine:", data.message);
      }
    } catch (error) {
      console.error("Greška na serveru:", error);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setActivePage('checkout');
  };

  const cartItemCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const openProductDetail = (proizvod) => {
    setSelectedProduct(proizvod);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const refreshProducts = async () => {
    try {
      const productsRes = await fetch(`${API_URL}/products`);
      const productsData = await productsRes.json();
      setProducts(productsData);
    } catch (error) {
      console.error("Greška pri osvežavanju proizvoda:", error);
    }
  };

  return (
    <div className="App">
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        handleSignIn={handleSignIn} 
        cartItemCount={cartItemCount}
        setSelectedProduct={setSelectedProduct}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      {activePage === 'admin' ? (
        <AdminPanel API_URL={API_URL} setProducts={setProducts} currentUser={currentUser} />
      ) : (
        <main className="content-area">
          {activePage === 'home' ? (
            <>
              <HeroSection setActivePage={setActivePage} t={t} />
              <InfoSection t={t} />
            </>
          ) : activePage === 'about' ? (
            <About t={t} />
          ) : activePage === 'contact' ? (
            <Contact t={t} API_URL={API_URL} />
          ) : activePage === 'cart' ? (
            <CartPage 
              cart={cart} 
              onRemove={handleRemoveFromCart} 
              onUpdateQuantity={handleUpdateQuantity}
              onCheckout={handleCheckout}
              setActivePage={setActivePage}
              t={t}
            />
          ) : activePage === 'checkout' ? (
            <Checkout 
              setActivePage={setActivePage} 
              cart={cart}
              setCart={setCart}
              API_URL={API_URL}
              t={t}
              onOrderSuccess={refreshProducts}
            />
          ) : activePage === 'profile' ? (
            <UserProfile currentUser={currentUser} API_URL={API_URL} t={t} />
          ) : activePage === 'subscribers' ? (
            <SubscribersList API_URL={API_URL} />
          ) : selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onClose={closeProductDetail} 
            onAddToCart={handleAddToCart} 
            t={t}
            API_URL={API_URL}
            currentUser={currentUser}
            onLogin={handleSignIn}
          />
          ) : (
            <>
              {serverError && (
                <div className="server-error-message">
                  <h3>⚠️ Greška u povezivanju</h3>
                  <p>{serverError}</p>
                </div>
              )}
              <ProductList
                rezultati={rezultati}
                searchTerm={searchTerm}
                t={t}
                openProductDetail={openProductDetail}
                handleAddToCart={handleAddToCart}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                categories={categories}
              />
            </>
          )}
        </main>
      )}

      <Footer setActivePage={setActivePage} setSelectedProduct={setSelectedProduct} setSearchTerm={setSearchTerm} t={t} API_URL={API_URL} />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeModal} 
        API_URL={API_URL} 
        setCurrentUser={setCurrentUser} 
        initialMode={authMode}
        t={t}
      />
    </div>
  );
}

export default App;
