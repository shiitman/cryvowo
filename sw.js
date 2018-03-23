var CACHE = 'cache-only';
var CACHE_EXTERNAL = 'cache-external';
console.log("test");
console.log(self);

this.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');

  evt.waitUntil(precache());
});


this.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.');
  console.log(evt.request);
  evt.respondWith(fromCache(evt.request).catch(function() {
    console.log("not in cache");
    return network(evt.request);
  }), CACHE);

  //evt.waitUntil(update(evt.request));

});


function precache() {
  console.log("precaching");
  return caches.open(CACHE).then(function(cache) {
    return cache.addAll(([
      '/',
      '/index.html',
      '/js/api.js',
      '/js/coinlist.js',
      '/js/currency.js',
      "/3dpart/d3.v5.min.js",
      "/3dpart/jquery.min.js",
      "/3dpart/jquery-ui.min.js",
      "/js/graph.js",
      "/js/worker.js",
      "/js/main.js",
      "/3dpart/jquery.ui.css",
      "/css/style.css "
    ]));
  });
}

function network(request) {
  return fetch(request).then(function(response) {
    update(request, CACHE_EXTERNAL);
    return response;
  }).catch(function() {
    return fromCache(request, CACHE_EXTERNAL);
  });
}

function fromCache(request, cache) {
  console.log("serving from cache");
  return caches.open(cache).then(function(cache) {
    return cache.match(request).then(function(matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request, cache) {
  return caches.open(cache).then(function(cache) {
    return fetch(request).then(function(response) {
      return cache.put(request, response);
    });
  });
}