/* Akal Academy Bhunsla – Service Worker for native notifications */
const CACHE_NAME = "akal-v1";
const ASSETS = ["./index.html", "./script.js", "./style.css", "./database.js", "./image.png"];

self.addEventListener("install", function(e) {
    e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(ASSETS); }));
    self.skipWaiting();
});

self.addEventListener("activate", function(e) {
    e.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(e) {
    e.respondWith(
        caches.match(e.request).then(function(r){ return r || fetch(e.request); })
    );
});

// Handle notification clicks — open/focus the app
self.addEventListener("notificationclick", function(e) {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: "window" }).then(function(list) {
            for (var c of list) {
                if (c.url && "focus" in c) return c.focus();
            }
            if (clients.openWindow) return clients.openWindow("./index.html");
        })
    );
});
