const CACHE_NAME = 'msfg-loan-tools-v1.0.0';
const urlsToCache = [
  '/',
  '/LoanToolsHub.html',
  '/LLPMTool.html',
  '/BuydownCalculator.html',
  '/APRCalculator.html',
  '/IncomeCalculatorQuestionnaire.html',
  '/theme-demo.html',
  '/llpm.js',
  '/buydown.js',
  '/llpm-data.js',
  '/manifest.json',
  '/theme-switcher.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications (for future mobile app features)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New loan calculation ready!',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('MSFG Loan Tools', options)
  );
});

