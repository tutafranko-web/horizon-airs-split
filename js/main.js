// ========== AOS Init ==========
AOS.init({ duration: 700, once: true, offset: 80 });

// ========== Navbar Scroll ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ========== Mobile Menu ==========
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle('hidden');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});
// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
    mobileMenu.classList.add('hidden');
  }
});

// ========== Active Nav Link Highlighting ==========
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.remove('text-brand-accent', '!text-brand-accent');
        link.classList.add('text-white/90');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('!text-brand-accent');
          link.classList.remove('text-white/90');
        }
      });
    }
  });
}, { rootMargin: '-20% 0px -60% 0px' });
sections.forEach(s => sectionObserver.observe(s));

// ========== Tour Tabs ==========
const tabs = document.querySelectorAll('.tour-tab');
const panels = document.querySelectorAll('.tour-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.classList.add('bg-gray-200', 'text-gray-700'); t.classList.remove('bg-brand-navy', 'text-white'); });
    tab.classList.add('active', 'bg-brand-navy', 'text-white');
    tab.classList.remove('bg-gray-200', 'text-gray-700');
    panels.forEach(p => p.classList.add('hidden'));
    document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
    initVisibleMaps();
  });
});

// ========== FAQ Accordion ==========
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').classList.add('hidden');
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.classList.remove('hidden');
    }
  });
});

// ========== Gallery Lightbox with Prev/Next ==========
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
let currentGalleryIndex = 0;

function showLightbox(index) {
  currentGalleryIndex = index;
  lightboxImg.src = galleryImages[index].src;
  lightboxImg.alt = galleryImages[index].alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function prevImage() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[currentGalleryIndex].src;
  lightboxImg.alt = galleryImages[currentGalleryIndex].alt;
}

function nextImage() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[currentGalleryIndex].src;
  lightboxImg.alt = galleryImages[currentGalleryIndex].alt;
}

galleryImages.forEach((img, i) => {
  img.addEventListener('click', () => showLightbox(i));
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

// ========== Back to Top Button ==========
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTop.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    backToTop.classList.add('opacity-100', 'translate-y-0');
  } else {
    backToTop.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    backToTop.classList.remove('opacity-100', 'translate-y-0');
  }
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== Form Submission Feedback ==========
const bookingForm = document.querySelector('form[action*="formsubmit"]');
if (bookingForm) {
  bookingForm.addEventListener('submit', function(e) {
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = currentLang === 'hr' ? 'Slanje...' : 'Sending...';
    btn.classList.add('opacity-70');
  });
}

// ========== Language Toggle (EN/HR) ==========
let currentLang = 'en';
const englishTexts = {};

// Store original English text on first load
document.querySelectorAll('[data-i18n]').forEach(el => {
  englishTexts[el.getAttribute('data-i18n')] = el.innerHTML;
});

// Store original English placeholders
const englishPlaceholders = {};
document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
  englishPlaceholders[el.getAttribute('data-i18n-placeholder')] = el.placeholder;
});

const croatianTexts = {
  // Nav
  'nav.home': 'Početna',
  'nav.about': 'O žirokopteru',
  'nav.pricing': 'Cijene',
  'nav.tours': 'Ture',
  'nav.bluecave': 'Modra špilja',
  'nav.reviews': 'Recenzije',
  'nav.gallery': 'Galerija',
  'nav.book': 'Rezervirajte let',

  // Hero
  'hero.line1': 'Panoramski letovi',
  'hero.line2': 'žirokopterom',
  'hero.line3': 'iznad Dalmacije',
  'hero.sub': 'Doživite Split, otoke i Zagoru iz ptičje perspektive — najsigurnijom letjelicom na svijetu',
  'hero.cta1': 'Rezervirajte let',
  'hero.cta2': 'Pogledajte ture',

  // About
  'about.title': 'Zašto žirokopter?',
  'about.sub': 'Najugodniji i najsigurniji način letenja',
  'about.p1': 'Žirokopter — ili autogyro — spaja slobodu helikoptera i eleganciju aviona u jedinstveno iskustvo letenja. Za razliku od helikoptera, rotor žirokoptera nije pokretan motorom, već se slobodno okreće zahvaljujući struji zraka.',
  'about.p2': 'To znači da čak i ako motor prestane raditi, <strong class="text-brand-navy">žirokopter ne pada</strong> — već sigurno klizi prema zemlji zahvaljujući prirodnom fenomenu koji se zove <strong class="text-brand-navy">autorotacija</strong>.',
  'about.p3': 'Zbog toga se žirokopteri diljem svijeta smatraju <strong class="text-brand-navy">jednom od najsigurnijih letjelica ikada proizvedenih</strong>.',
  'about.p4': 'Lete mirno, stabilno i predvidivo — čak i u vjetrovitim uvjetima — dok putnicima pružaju nevjerojatno čist i otvoren pogled na krajolik.',
  'about.p5': 'Upravo ta kombinacija sigurnosti, slobode i pogleda bez prepreka čini svaki let s Horizon Airs Split posebnim iskustvom koje ćete pamtiti zauvijek.',
  'about.stat1t': 'Najsigurnija letjelica',
  'about.stat1d': 'Autorotacija = sigurno slijetanje uvijek',
  'about.stat2t': '300-600m visine',
  'about.stat2d': 'Savršen pogled na Dalmaciju',
  'about.stat3t': 'Licencirani piloti',
  'about.stat3d': 'Profesionalni piloti, europski standardi',
  'about.stat4t': 'EASA standardi',
  'about.stat4d': 'Svi letovi prema europskim standardima',

  // Pricing
  'price.title': 'Cijene letova',
  'price.sub': 'Jednostavan cjenik — bez skrivenih troškova',
  'price.standard': 'Standardni panoramski letovi',
  'price.min15': '15 minuta',
  'price.min30': '30 minuta',
  'price.min45': '45 minuta',
  'price.min60': '60 minuta',
  'price.min90': '90 minuta',
  'price.min120': '120 minuta',
  'price.pp': 'po osobi',
  'price.popular': 'NAJPOPULARNIJE',
  'price.privatetitle': 'Privatni charter letovi',
  'price.privatedesc': 'Ekskluzivni letovi za parove, posebne prilike, romantične prosidbe, poslovne promo snimke i prilagođene rute. Letite u formaciji s našom flotom za zaista jedinstveno iskustvo.',
  'price.pf1': 'Prilagođeno planiranje rute',
  'price.pf2': 'Letovi u paru i formaciji',
  'price.pf3': 'Foto i video produkcijski letovi',
  'price.pf4': 'Poklon-vaučeri (12 mjeseci valjanosti)',
  'price.privatecta': 'Kontaktirajte nas za ponudu',
  'price.gopro.title': 'GoPro snimanje',
  'price.gopro.desc': 'Profesionalno snimanje s GoPro Hero i GoPro 360 kamerama. Proživite svaki trenutak vaše avanture iz zraka.',
  'price.gopro.per': 'po snimci',
  'price.gopro.free': 'BESPLATNO za sve letove dulje od 90 minuta!',
  'price.note': 'U cijenu su uključeni svi troškovi letenja, oprema, kaciga, komunikacijski sustav i briefing s pilotom. Preporučujemo ne koristiti osobne telefone tijekom leta — naše GoPro snimanje osigurava najbolje snimke bez rizika.',

  // Tours
  'tours.title': 'Naše ture',
  'tours.sub': 'Odaberite svoju avanturu — morske rute, planinske panorame ili letove iz Sinja',
  'tours.tabsea': 'Morski plan',
  'tours.tabmount': 'Planinski plan',
  'tours.tabsinj': 'Plan iz Sinja',
  'tours.seadep': 'Polazak: <strong>Split Luka</strong> — Letovi iznad otoka i obale',
  'tours.mountdep': 'Polazak: <strong>Split</strong> — Letovi prema unutrašnjosti Dalmacije',
  'tours.sinjdep': 'Polazak: <strong>Aerodrom Piket, Sinj</strong> — Letovi iz srca Dalmatinske zagore',
  'tours.sea15.desc': 'Kratak, ali nezaboravan let koji pokazuje Split iz najposebnijeg kuta — iz zraka. Dok žirokopter uzlijeće iznad trajektne luke, otkriva se panoramski pogled na Rivu, Dioklecijanovu palaču i Marjan.',
  'tours.sea30.desc': 'Ova tura vodi vas iznad Splita, Čiova i Trogira — tri dragulja Dalmacije. U svega pola sata preletjet ćete kulturne simbole Jadrana.',
  'tours.sea45.desc': 'Spektakularan panoramski let iznad tri otoka pruža pogled na tirkizne lagune, maslinike i skrivene uvale. Nakon preleta nad Zlatnim ratom na Braču, let se nastavlja prema Šolti i kristalno čistim vodama Blue Lagoona.',
  'tours.sea60.desc': 'Najpopularnija morska ruta Horizon Airsa, koja spaja sve najpoznatije ljepote srednje Dalmacije. Letite iznad Brača, Hvara, Paklenih otoka i Šolte uz pogled koji oduzima dah.',
  'tours.sea90.desc': 'Jedinstven let koji povezuje Brač, Hvar, Vis i Paklene otoke u savršenom ritmu mora i neba. Tijekom 90 minuta svjedočit ćete najljepšim panoramama otoka i zaljeva.',
  'tours.sea120.desc': 'Najduži i najluksuzniji morski izlet. Ruta vodi iz Splita prema Braču, Hvaru, Visu i Biševu s preletom iznad čuvene Modre špilje. Prava sinfonija plavetnila, svjetlosti i tišine.',
  'tours.kornati.name': 'Ekskluzivni let na Kornate',
  'tours.kornati.desc': 'Polazak iz Splita i let iznad Primoštena, Šibenika i NP Krke vodi vas do jednog od najimpresivnijih nacionalnih parkova Hrvatske — Kornata. Iz zraka se otkriva veličanstveni mozaik od preko 80 otoka.',
  'tours.mount35.desc': 'Let iznad smaragdne rijeke Cetine otkriva njezin veličanstveni kanjon koji vijuga kroz kamen i zelenilo. Savršen izlet za ljubitelje prirode i tišine.',
  'tours.mount45.desc': 'Panoramski let koji spaja planine i more u jednom pogledu. Vidjet ćete veličanstvene stijene Mosora, Omišku klisuru i ušće Cetine u more.',
  'tours.mount60.desc': 'Let započinje iznad Splita i završava iznad izvora rijeke Cetine, poznatog kao "Oko zemlje". Ova ruta simbolizira put života — od mora do izvora.',
  'tours.mount90.desc': 'Let iznad Sinja, Peruće i obronaka Dinare pruža pogled na najzeleniji dio Dalmacije. Savršena tura za one koji traže spokoj i duboku povezanost s prirodom.',
  'tours.mount120.desc': 'Najduža i najraznovrsnija planinska tura vodi vas preko Knina, Dinare, Krčića i Peruće. Let koji otkriva geološke, povijesne i prirodne dragulje Dalmacije.',
  'tours.sinj15.desc': 'Let iznad Sinjskog polja i Tvrđave Kamičak nudi jedinstven pogled na Alkarski grad i dolinu Cetine. Savršen za kratko, ali dojmljivo iskustvo leta.',
  'tours.sinj30.desc': 'Ruta koja vodi iz Sinja do mitskog izvora Cetine, "Oka zemlje". Ova tura simbolizira povezanost čovjeka i prirode — tiha, emotivna i nezaboravna.',
  'tours.sinj45.desc': 'Iz Sinja prema Omišu, kroz dolinu i kanjon Cetine — spoj planine i mora u jednom letu. Idealna tura za one koji žele vidjeti srce Dalmacije s visine.',
  'tours.sinj60.desc': 'Jedna od najljepših ruta Horizon Airsa — pogled na Dinaru, Mosor, Šoltu i Brač. Let koji u sat vremena prikazuje cijelu Dalmaciju u jednom dahu.',
  'tours.sinj90.desc': 'Let koji prati rijeku Cetinu od izvora do mora. Simboličan, miran i spektakularan krug koji priča priču o snazi i ljepoti života u Dalmaciji.',
  'tours.sinj120.desc': 'Najveći let koji spaja planine, otoke, rijeke i obalu u jedno epsko iskustvo. Od Sinja do mora i natrag — ovo nije samo let, ovo je priča o Dalmaciji viđena iz neba.',

  // Blue Cave
  'cave.badge': 'EKSKLUZIVNA TURA',
  'cave.title': 'Modra špilja iz zraka',
  'cave.sub': 'Doživite jedno od najljepših čuda Jadrana iz potpuno nove perspektive — iz zraka!',
  'cave.desc': 'Polazak iz Splita, uz spektakularan let iznad Bračkog kanala, otoka Hvara, paklenskih otoka Visa i Biševa, završava nezaboravnim prizorom Modre špilje, svjetski poznate po svojoj čarobnoj plavoj svjetlosti.',
  'cave.pp': 'po osobi',
  'cave.duration': 'Oko <strong>60 minuta</strong> (uključujući polijetanje i povratak)',
  'cave.departure': 'Polazak: <strong>Split Luka</strong> (amfibijski žirokopter)',
  'cave.cta': 'Rezervirajte let na Modru špilju',

  // Reviews
  'reviews.title': 'Što kažu naši putnici',
  'reviews.sub': 'Autentične recenzije stvarnih gostiju',

  // Gallery
  'gallery.title': 'Galerija',
  'gallery.sub': 'Dalmacija iz ptičje perspektive',

  // FAQ
  'faq.title': 'Najčešća pitanja',
  'faq.sub': 'Sve što trebate znati prije leta',
  'faq.cat1': 'Općenita pitanja',
  'faq.q1': 'Što je žirokopter?',
  'faq.a1': 'Žirokopter (autogyro) je zrakoplov koji kombinira najbolje karakteristike helikoptera i aviona. Rotor se ne pokreće motorom, već se slobodno okreće u zraku, što omogućuje izuzetno stabilan i siguran let. Zahvaljujući principu autorotacije, žirokopter ne može „pasti" čak ni u slučaju kvara motora — što ga čini jednom od najsigurnijih letjelica na svijetu.',
  'faq.q2': 'Koliko je žirokopter siguran?',
  'faq.a2': 'Vrlo siguran. Žirokopter leti stabilno, mirno i kontrolirano, a u slučaju kvara motora rotor nastavlja slobodno rotirati, omogućujući sigurno i mekano slijetanje. Upravo zato se koristi i u školama letenja i zračnim patrolama diljem svijeta.',
  'faq.q3': 'Koliko osoba može letjeti u jednom žirokopteru?',
  'faq.a3': 'Žirokopter ima dva mjesta — jedno za pilota i jedno za putnika. Za parove ili grupe, Horizon Airs Split nudi mogućnost usklađenih letova u paru pomoću flote žirokoptera, tako da možete letjeti jedan uz drugog.',
  'faq.q4': 'Koliko visoko leti žirokopter?',
  'faq.a4': 'Najčešće letimo između 300 i 600 metara visine, ovisno o ruti i uvjetima, što omogućuje savršen pogled na Dalmaciju i njene otoke.',
  'faq.q5': 'Tko upravlja letjelicom?',
  'faq.a5': 'Svi letovi obavljaju se uz licencirane profesionalne pilote uz striktno poštivanje svih sigurnosnih standarda Hrvatske agencije za civilno zrakoplovstvo (HACZ) i Europske agencije za sigurnost zračnog prometa (EASA).',
  'faq.cat2': 'Rezervacije i plaćanje',
  'faq.q6': 'Kako mogu rezervirati let?',
  'faq.a6': 'Let možete rezervirati direktno putem naše web stranice. Nakon što odaberete termin i rutu, primit ćete potvrdu i upute za uplatu akontacije.',
  'faq.q7': 'Koje načine plaćanja prihvaćate?',
  'faq.a7': 'Prihvaćamo sve načine plaćanja — gotovinu, Mastercard, Visa, Revolut, Aircash, Bitcoin i druge popularne oblike digitalnog plaćanja.',
  'faq.q8': 'Mogu li otkazati ili promijeniti rezervaciju?',
  'faq.a8': 'Da. Rezervaciju možete otkazati ili promijeniti najkasnije 72 sata prije termina, bez ikakvih troškova. U tom slučaju, akontacija se u potpunosti vraća. Za otkazivanja unutar 72 sata, akontacija se zadržava.',
  'faq.q9': 'Što ako se let otkaže zbog vremena?',
  'faq.a9': 'Ako vremenski uvjeti nisu pogodni, let se odgađa za prvi slobodan termin koji vama odgovara. Ako novi termin ne možete prihvatiti, akontacija se u cijelosti vraća.',
  'faq.cat3': 'Tijek leta i iskustvo',
  'faq.q10': 'Moram li imati prethodno iskustvo u letenju?',
  'faq.a10': 'Ne, nije potrebno nikakvo iskustvo. Pilot vodi cijeli let i objasnit će vam sve prije polijetanja. Vaš zadatak je samo — uživati u pogledu!',
  'faq.q11': 'Mogu li snimati let?',
  'faq.a11': 'Let se može snimati od strane putnika, ali to nije preporučljivo zbog rizika od gubitka mobitela. Zato Horizon Airs Split nudi profesionalno snimanje s GoPro Hero i GoPro 360 kamerama po cijeni od 20€ po snimci, dok je snimanje besplatno za letove dulje od 90 minuta.',
  'faq.q12': 'Postoji li težinsko ograničenje?',
  'faq.a12': 'Da, iz sigurnosnih razloga maksimalna težina putnika je 115 kg.',
  'faq.q13': 'Što trebam ponijeti?',
  'faq.a13': 'Ponesite sunčane naočale i laganu jaknu — kaciga, komunikacijski sustav i sigurnosna oprema osigurani su na licu mjesta.',
  'faq.cat4': 'Posebne usluge',
  'faq.q14': 'Nudite li poklon-vaučere?',
  'faq.a14': 'Da, nudimo personalizirane poklon-vaučere s trajanjem od 12 mjeseci — idealne za rođendane, godišnjice ili poslovne poklone.',
  'faq.q15': 'Organizirate li posebne letove za parove i snimanja?',
  'faq.a15': 'Da, uz standardne panoramske rute nudimo romantične letove u paru, foto i video letove te business promo letove za marketinške snimke i evente. Za parove organiziramo sinkronizirane letove flote.',
  'faq.cat5': 'Sigurnost i licence',
  'faq.q16': 'Tko nadzire vaše letove?',
  'faq.a16': 'Svi letovi se obavljaju u skladu s propisima Hrvatske agencije za civilno zrakoplovstvo (HACZ) i Europske agencije za sigurnost zračnog prometa (EASA).',
  'faq.q17': 'Kako se održavaju letjelice?',
  'faq.a17': 'Žirokopteri se redovito servisiraju prema uputama proizvođača (AutoGyro MTO 914, motor Rotax 914), uz redovne 25-, 100-, 200- i 500-satne preglede. Svi dijelovi su originalni i zamjenjuju se prema certificiranim standardima.',

  // Booking
  'book.title': 'Rezervirajte svoj let',
  'book.sub': 'Ispunite obrazac i javit ćemo vam se u najkraćem roku',
  'book.name': 'Ime i prezime *',
  'book.phone': 'Telefon',
  'book.date': 'Željeni datum',
  'book.tour': 'Odaberite turu *',
  'book.msg': 'Poruka',
  'book.submit': 'Pošaljite upit',

  // Footer
  'footer.desc': 'Panoramski letovi žirokopterom iznad Dalmacije. Najsigurnija letjelica, licencirani piloti, nezaboravni pogledi.',
  'footer.contact': 'Kontakt',
  'footer.region': 'Splitsko-dalmatinska županija, Hrvatska',
  'footer.links': 'Brze veze',
  'footer.l1': 'Naše ture',
  'footer.l2': 'Cijene',
  'footer.l4': 'Rezervacija',
  'footer.safety': 'Sigurnost',
  'footer.s1': 'HACZ — Hrvatska agencija za civilno zrakoplovstvo',
  'footer.s2': 'EASA — Europska agencija za sigurnost zračnog prometa',
  'footer.copy': '&copy; 2026 Horizon Airs Split. Sva prava pridržana.'
};

const croatianPlaceholders = {
  'book.nameph': 'Vaše ime',
  'book.msgph': 'Posebni zahtjevi, broj putnika, pitanja...'
};

// Booking dropdown translations
const englishOptions = {};
const croatianOptions = {
  '-- Select a tour --': '-- Odaberite turu --',
  'Coastal Routes (Split Harbor)': 'Morske rute (Split Luka)',
  'Mountain Routes (Split)': 'Planinske rute (Split)',
  'Sinj Routes (Piket Airfield)': 'Rute iz Sinja (Aerodrom Piket)',
  'Exclusive': 'Ekskluzivno',
  'Private Charter': 'Privatni charter',
  '15 min — Split Skyline Flight (75 €)': '15 min — Let iznad Splita (75 €)',
  '30 min — Island & City (150 €)': '30 min — Otok i grad (150 €)',
  '45 min — Three Islands (225 €)': '45 min — Tri otoka (225 €)',
  '60 min — Golden Circle of Dalmatia (250 €)': '60 min — Zlatni krug Dalmacije (250 €)',
  '90 min — Grand Dalmatian Symphony (375 €)': '90 min — Dalmatinska simfonija (375 €)',
  '120 min — Royal Adriatic Flight (470 €)': '120 min — Kraljevski jadranski let (470 €)',
  '120 min — Exclusive Kornati Flight (470 €)': '120 min — Ekskluzivni let na Kornate (470 €)',
  '35 min — Cetina Canyon (175 €)': '35 min — Kanjon Cetine (175 €)',
  '45 min — Mosor & Omiš Gorge (225 €)': '45 min — Mosor i Omiška klisura (225 €)',
  '60 min — From Sea to Source (250 €)': '60 min — Od mora do izvora (250 €)',
  '90 min — Green Heart of Dalmatia (375 €)': '90 min — Zeleno srce Dalmacije (375 €)',
  '120 min — Dalmatian Eco Expedition (470 €)': '120 min — Dalmatinska eko ekspedicija (470 €)',
  '15 min — Sinj Panorama (75 €)': '15 min — Panorama Sinja (75 €)',
  '30 min — Source of Life (150 €)': '30 min — Izvor života (150 €)',
  '45 min — Mosor & Cetina (225 €)': '45 min — Mosor i Cetina (225 €)',
  '60 min — Sea & Mountains of Dalmatia (250 €)': '60 min — More i planine Dalmacije (250 €)',
  '90 min — Golden Circle of the Cetina (375 €)': '90 min — Zlatni krug Cetine (375 €)',
  '120 min — Dalmatian Epic Flight (470 €)': '120 min — Epski dalmatinski let (470 €)',
  'Blue Cave — exclusive flight (260 €)': 'Modra špilja — ekskluzivni let (260 €)',
  'Private Charter — custom route (contact us)': 'Privatni charter — prilagođena ruta (kontaktirajte nas)',
  'Couples Formation Flight (contact us)': 'Let u formaciji za parove (kontaktirajte nas)',
  'Photo & Video Production Flight (contact us)': 'Foto i video produkcijski let (kontaktirajte nas)'
};

function setLanguage(lang) {
  currentLang = lang;
  const texts = lang === 'hr' ? croatianTexts : englishTexts;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (texts[key]) {
      el.innerHTML = texts[key];
    }
  });

  // Translate placeholders
  const placeholders = lang === 'hr' ? croatianPlaceholders : englishPlaceholders;
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (placeholders[key]) {
      el.placeholder = placeholders[key];
    }
  });

  // Translate booking dropdown
  const select = document.querySelector('select[name="tour"]');
  if (select) {
    const translations = lang === 'hr' ? croatianOptions : null;
    select.querySelectorAll('option').forEach(opt => {
      if (!opt.dataset.originalText) opt.dataset.originalText = opt.textContent;
      if (translations && translations[opt.dataset.originalText]) {
        opt.textContent = translations[opt.dataset.originalText];
      } else if (!translations) {
        opt.textContent = opt.dataset.originalText;
      }
    });
    select.querySelectorAll('optgroup').forEach(grp => {
      if (!grp.dataset.originalLabel) grp.dataset.originalLabel = grp.label;
      if (translations && translations[grp.dataset.originalLabel]) {
        grp.label = translations[grp.dataset.originalLabel];
      } else if (!translations) {
        grp.label = grp.dataset.originalLabel;
      }
    });
  }

  document.documentElement.lang = lang === 'hr' ? 'hr' : 'en';

  // Update toggle buttons
  const label = lang === 'hr' ? 'EN \uD83C\uDDEC\uD83C\uDDE7' : 'HR \uD83C\uDDED\uD83C\uDDF7';
  document.getElementById('lang-toggle').innerHTML = label;
  document.getElementById('lang-toggle-mobile').innerHTML = label;
}

// Store original placeholders for English restore
document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
  englishPlaceholders[el.getAttribute('data-i18n-placeholder')] = el.placeholder;
});

document.getElementById('lang-toggle').addEventListener('click', () => {
  setLanguage(currentLang === 'en' ? 'hr' : 'en');
});
document.getElementById('lang-toggle-mobile').addEventListener('click', () => {
  setLanguage(currentLang === 'en' ? 'hr' : 'en');
});

// ========== Leaflet Maps ==========
const mapInstances = {};

const mapConfigs = {
  // SEA ROUTES
  'map-sea-15': {
    center: [43.507, 16.439], zoom: 11, color: '#0a5',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.515, 16.409], name: 'Marjan' },
      { pos: [43.55, 16.37], name: 'Kaštelanski zaljev' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },
  'map-sea-30': {
    center: [43.507, 16.439], zoom: 11, color: '#0a5',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.515, 16.409], name: 'Marjan' },
      { pos: [43.49, 16.27], name: 'Čiovo' },
      { pos: [43.516, 16.25], name: 'Trogir (UNESCO)' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },
  'map-sea-45': {
    center: [43.4, 16.35], zoom: 10, color: '#0a5',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.32, 16.42], name: 'Splitska vrata' },
      { pos: [43.257, 16.642], name: 'Brač (Zlatni rat)' },
      { pos: [43.4, 16.21], name: 'Šolta (Maslinica)' },
      { pos: [43.44, 16.15], name: 'Blue Lagoon (Krknjaši)' },
      { pos: [43.49, 16.27], name: 'Čiovo' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },
  'map-sea-60': {
    center: [43.35, 16.35], zoom: 10, color: '#0a5',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.257, 16.642], name: 'Brač (Zlatni rat)' },
      { pos: [43.172, 16.442], name: 'Hvar (grad)' },
      { pos: [43.157, 16.372], name: 'Pakleni otoci' },
      { pos: [43.44, 16.15], name: 'Blue Lagoon (Krknjaši)' },
      { pos: [43.4, 16.21], name: 'Šolta (Maslinica)' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },
  'map-sea-90': {
    center: [43.3, 16.3], zoom: 9, color: '#0a5',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.257, 16.642], name: 'Brač (Zlatni rat)' },
      { pos: [43.172, 16.442], name: 'Hvar (grad)' },
      { pos: [43.157, 16.372], name: 'Pakleni otoci' },
      { pos: [43.063, 16.182], name: 'Vis' },
      { pos: [43.4, 16.21], name: 'Šolta (Maslinica)' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },
  'map-sea-120': {
    center: [43.25, 16.25], zoom: 9, color: '#0a5',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.257, 16.642], name: 'Zlatni rat (Bol, Brač)' },
      { pos: [43.172, 16.442], name: 'Hvar (grad)' },
      { pos: [43.157, 16.372], name: 'Pakleni otoci' },
      { pos: [43.063, 16.182], name: 'Vis' },
      { pos: [43.028, 16.184], name: 'Uvala Stiniva' },
      { pos: [42.98, 16.0], name: 'Biševo (Plava špilja)' },
      { pos: [43.4, 16.21], name: 'Šolta (Maslinica)' },
      { pos: [43.44, 16.15], name: 'Blue Lagoon (Krknjaši)' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },
  'map-sea-kornati': {
    center: [43.65, 16.0], zoom: 8, color: '#0077cc',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [43.586, 15.923], name: 'Primošten' },
      { pos: [43.734, 15.895], name: 'Šibenik' },
      { pos: [43.801, 15.967], name: 'NP Krka (Skradinski buk)' },
      { pos: [43.78, 15.29], name: 'NP Kornati' },
      { pos: [43.64, 15.67], name: 'Otok Žirje' },
      { pos: [43.68, 15.84], name: 'Zlarin' },
      { pos: [43.516, 16.25], name: 'Trogir' },
      { pos: [43.507, 16.439], name: 'Split Luka (FINISH)' }
    ]
  },

  // MOUNTAIN ROUTES
  'map-mount-35': {
    center: [43.6, 16.55], zoom: 10, color: '#06f',
    points: [
      { pos: [43.508, 16.44], name: 'Split (START)' },
      { pos: [43.703, 16.639], name: 'Sinj' },
      { pos: [43.47, 16.72], name: 'Kanjon Cetine' },
      { pos: [43.508, 16.44], name: 'Split (FINISH)' }
    ]
  },
  'map-mount-45': {
    center: [43.5, 16.56], zoom: 10, color: '#06f',
    points: [
      { pos: [43.508, 16.44], name: 'Split (START)' },
      { pos: [43.57, 16.67], name: 'Mosor' },
      { pos: [43.44, 16.69], name: 'Omiš' },
      { pos: [43.508, 16.44], name: 'Split (FINISH)' }
    ]
  },
  'map-mount-60': {
    center: [43.7, 16.5], zoom: 9, color: '#06f',
    points: [
      { pos: [43.508, 16.44], name: 'Split (START)' },
      { pos: [43.56, 16.52], name: 'Klis' },
      { pos: [43.703, 16.639], name: 'Sinj' },
      { pos: [43.98, 16.44], name: 'Izvor Cetine (Oko zemlje)' },
      { pos: [43.44, 16.69], name: 'Omiš' },
      { pos: [43.508, 16.44], name: 'Split (FINISH)' }
    ]
  },
  'map-mount-90': {
    center: [43.75, 16.42], zoom: 9, color: '#06f',
    points: [
      { pos: [43.508, 16.44], name: 'Split (START)' },
      { pos: [43.703, 16.639], name: 'Sinj' },
      { pos: [43.98, 16.44], name: 'Izvor Cetine' },
      { pos: [44.07, 16.38], name: 'Dinara' },
      { pos: [44.0, 16.38], name: 'Peruća' },
      { pos: [43.508, 16.44], name: 'Split (FINISH)' }
    ]
  },
  'map-mount-120': {
    center: [43.75, 16.42], zoom: 9, color: '#06f',
    points: [
      { pos: [43.508, 16.44], name: 'Split (START)' },
      { pos: [44.07, 16.38], name: 'Dinara' },
      { pos: [44.04, 16.2], name: 'Knin' },
      { pos: [44.04, 16.23], name: 'Krčić slap' },
      { pos: [44.0, 16.38], name: 'Peruća' },
      { pos: [43.44, 16.69], name: 'Omiš' },
      { pos: [43.508, 16.44], name: 'Split (FINISH)' }
    ]
  },

  // SINJ ROUTES
  'map-sinj-15': {
    center: [43.695, 16.65], zoom: 12, color: '#c20',
    points: [
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (START)' },
      { pos: [43.703, 16.639], name: 'Tvrđava Kamičak' },
      { pos: [43.69, 16.62], name: 'Sinjsko polje' },
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (FINISH)' }
    ]
  },
  'map-sinj-30': {
    center: [43.85, 16.55], zoom: 10, color: '#c20',
    points: [
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (START)' },
      { pos: [43.98, 16.44], name: 'Izvor Cetine (Oko zemlje)' },
      { pos: [44.0, 16.38], name: 'Peruća' },
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (FINISH)' }
    ]
  },
  'map-sinj-45': {
    center: [43.6, 16.65], zoom: 10, color: '#c20',
    points: [
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (START)' },
      { pos: [43.57, 16.57], name: 'Dugopolje/Mosor' },
      { pos: [43.44, 16.69], name: 'Omiš' },
      { pos: [43.62, 16.72], name: 'Trilj' },
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (FINISH)' }
    ]
  },
  'map-sinj-60': {
    center: [43.5, 16.45], zoom: 9, color: '#c20',
    points: [
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (START)' },
      { pos: [43.57, 16.67], name: 'Mosor' },
      { pos: [43.44, 16.69], name: 'Omiš' },
      { pos: [43.257, 16.642], name: 'Brač (Zlatni rat)' },
      { pos: [43.4, 16.21], name: 'Šolta (Maslinica)' },
      { pos: [43.508, 16.44], name: 'Split (centar)' },
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (FINISH)' }
    ]
  },
  'map-sinj-90': {
    center: [43.75, 16.4], zoom: 9, color: '#c20',
    points: [
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (START)' },
      { pos: [44.07, 16.38], name: 'Dinara' },
      { pos: [44.04, 16.2], name: 'Knin' },
      { pos: [44.04, 16.23], name: 'Krčić slap' },
      { pos: [44.0, 16.38], name: 'Peruća' },
      { pos: [43.56, 16.52], name: 'Klis' },
      { pos: [43.508, 16.44], name: 'Split (centar)' },
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (FINISH)' }
    ]
  },
  'map-sinj-120': {
    center: [43.6, 16.4], zoom: 8, color: '#c20',
    points: [
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (START)' },
      { pos: [44.07, 16.38], name: 'Dinara' },
      { pos: [44.04, 16.2], name: 'Knin' },
      { pos: [44.04, 16.23], name: 'Krčić slap' },
      { pos: [43.98, 16.44], name: 'Izvor Cetine' },
      { pos: [44.0, 16.38], name: 'Peruća' },
      { pos: [43.57, 16.67], name: 'Mosor' },
      { pos: [43.44, 16.69], name: 'Omiš' },
      { pos: [43.257, 16.642], name: 'Brač (Zlatni rat)' },
      { pos: [43.172, 16.442], name: 'Hvar (grad)' },
      { pos: [43.508, 16.44], name: 'Split (centar)' },
      { pos: [43.692, 16.673], name: 'Aerodrom Piket (FINISH)' }
    ]
  },

  // MODRA ŠPILJA
  'map-modra-spilja': {
    center: [43.25, 16.22], zoom: 9, color: '#e63946',
    points: [
      { pos: [43.507, 16.439], name: 'Split Luka (START)' },
      { pos: [42.9833, 16.006], name: 'Uvala Mezoporat — Blue Cave' }
    ]
  }
};

function createMap(id, config) {
  const el = document.getElementById(id);
  if (!el || mapInstances[id]) return;
  if (el.offsetParent === null) return;

  const map = L.map(id, { scrollWheelZoom: false }).setView(config.center, config.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const path = [];
  config.points.forEach(pt => {
    L.circleMarker(pt.pos, { radius: 6, color: config.color, fillColor: config.color, fillOpacity: 0.8, weight: 2 }).addTo(map).bindPopup('<b>' + pt.name + '</b>');
    path.push(pt.pos);
  });

  const poly = L.polyline(path, { color: config.color, weight: 3, opacity: 0.85 }).addTo(map);
  map.fitBounds(poly.getBounds(), { padding: [20, 20] });
  mapInstances[id] = map;
}

function initVisibleMaps() {
  Object.keys(mapConfigs).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetParent !== null && !mapInstances[id]) {
      createMap(id, mapConfigs[id]);
    }
  });
  Object.values(mapInstances).forEach(m => m.invalidateSize());
}

window.addEventListener('load', () => {
  setTimeout(initVisibleMaps, 500);
});

const mapObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      if (mapConfigs[id] && !mapInstances[id]) {
        createMap(id, mapConfigs[id]);
      }
    }
  });
}, { rootMargin: '100px' });

document.querySelectorAll('[id^="map-"]').forEach(el => {
  mapObserver.observe(el);
});
