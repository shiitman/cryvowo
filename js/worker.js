/*jshint esversion: 6 */
class CryptoWorker {
  constructor() {
    this.worker = null;
  }
  startWorker() {
    if (typeof(Worker) !== "undefined") {
      if (this.worker == null) {
        this.worker = new Worker("/sw/sw.js");
        console.log(this.worker);
      }
      this.worker.onmessage = function(event) {
        console.log(event.data);
      };
    } else {
      console.log("No support");
    }
  }

  stopWorker() {
    if (this.worker == null) {
      return;
    }
    this.worker.terminate();
    this.worker = null;
  }

}