
const CACHE_NAME = "vida-facil-v2";

const ARCHIVOS = [
  "/vida-f-cil/",
  "/vida-f-cil/index.html",
  "/vida-f-cil/manifest.json"
];

// Instalar la nueva versión
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// Activar la nueva versión y eliminar cachés antiguas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Intentar obtener siempre la versión más reciente
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copia = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copia);
          });
        }

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(archivoGuardado => {
          if (archivoGuardado) return archivoGuardado;

          if (event.request.mode === "navigate") {
            return caches.match("/vida-f-cil/");
          }

          return Response.error();
        })
      )
  );
});
