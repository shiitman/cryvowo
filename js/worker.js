/*jshint esversion: 6 */
class CryptoWorker {
  constructor() {}

  startWorker() {
    navigator.serviceWorker.register('sw.js', {});
  }

  stopWorker() {

  }

}