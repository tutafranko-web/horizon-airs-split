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
mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});

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
    // Initialize maps for newly visible tab
    initVisibleMaps();
  });
});

// ========== FAQ Accordion ==========
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    // Close all
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

// ========== Gallery Lightbox ==========
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
  });
});
lightbox.addEventListener('click', () => lightbox.classList.remove('active'));

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
      { pos: [42.9833, 16.006], name: 'Uvala Mezoporat — Modra špilja' }
    ]
  }
};

function createMap(id, config) {
  const el = document.getElementById(id);
  if (!el || mapInstances[id]) return;
  // Check if element is visible
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
  // Invalidate size for all existing maps
  Object.values(mapInstances).forEach(m => m.invalidateSize());
}

// Initialize maps on load and tab switch
window.addEventListener('load', () => {
  setTimeout(initVisibleMaps, 500);
});

// Use IntersectionObserver for lazy map loading
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
