"use strict";

const CACHE_NAME = "moon-patrol-pwa-v7";
const INDEX_URL = new URL("./index.html", self.location).href;
const APP_SHELL = [
  "./index.html",
  "./manifest.webmanifest",
  "./images/logo.png",
  "./images/logomoon.png",
  "./images/fundo%20do%20jogo.png",
  "./images/patrol-0.png",
  "./images/patrol-1.png",
  "./images/patrol-2.png",
  "./images/favicon.ico?v=2",
  "./images/favicon-32.png?v=2",
  "./images/apple-touch-icon.png?v=2",
  "./images/pwa-192.png?v=2",
  "./images/pwa-512.png?v=2",
  "./images/pwa-maskable-512.png?v=2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((path) => new URL(path, self.location).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("moon-patrol-pwa-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
              cache.put(INDEX_URL, response.clone());
            });
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(INDEX_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
