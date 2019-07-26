const Parser = require('evtx-parser');
const fs = require('fs');

class EvtxListener {
  /**
   * Initialize a listener
   * @param {*} filename 
   */
  constructor(filename) {
    this._filename = filename;
    this._evtx = new Parser(filename);
    this._cb = [];
    this.eventIds = [];
    this.dateStart = null;
    this.dateEnd = null;
    this.interval = 5000;
    this.start();
  }
  /**
   * Internal loop for checking changes
   */
  _check() {
    try {
      if (!this._evtx.refresh()) return false;
      let size = this._evtx.size();
      for(let i = 0; i < size; i++) {
        if (this._chunks.hasOwnProperty(i)) {
          // chunk already exists
          let evtId = this._evtx.chunk(i).lastEventId;
          if (evtId != this._chunks[i]) {
            this._evtx.chunk(i).forEach((evt) => {
              if (evt.id > this._chunks[i]) {
                // trigger only new events
                this._trigger(evt);
              }
            });
          }
        } else {
          // try to trigger every event
          this._evtx.chunk(i).forEach((evt) => {
            this._trigger(evt);
          });
        }
      }
      return true;
    } catch(e) {
      console.error(e);
    }
  }

  /**
   * Reset chunks tracking
   */
  _reset() {
    this._chunks = {};
    try {
      let size = this._evtx.size();
      for(let i = 0; i < size; i++) {
        this._chunks[i] = this._evtx.chunk(i).lastEventId;
      }  
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Try to trigger event
   * @param {*} evt 
   */
  _trigger(evt) {
    if (this.eventIds.length > 0) {
      if (this.eventIds.indexOf(evt.data.EventId) == -1) return;
    }
    if (this.dateStart) {
      if (evt.date < this.dateStart) return;
    }
    if (this.dateEnd) {
      if (evt.date > this.dateEnd) return;
    }
    // triggers changes
    this._cb.forEach(function(cb) {
      cb(evt);
    });
  }

  /**
   * Stop to listen changes
   */
  stop() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    return this;
  }

  /**
   * Start changes
   */
  start() {
    this._reset();
    this._timer = setTimeout(() => {
      // console.log(new Date());
      this._check();
      this.start();
    }, this.interval);
    return this;
  }
  /**
   * Listener
   * @param {*} cb 
   */
  onChange(cb) {
    this._cb.push(cb);
    return this;
  }
  /**
   * Add a filter on eventId
   * @param {*} eventId 
   */
  eventId(eventId) {
    if (typeof eventId === 'undefined') {
      this.eventIds = [];
    }
    if (this.eventIds.indexOf(eventId) === -1)  {
      this.eventIds.push(eventId);
    }
    return this;
  }
  /**
   * Add a filter on date
   * @param {*} start 
   */
  fromDate(start) {
    this.dateStart = start;
    return this;
  }
  /**
   * Add a filter on date
   * @param {*} end 
   */
  toDate(end) {
    this.dateEnd = end;
    return this;
  }
}
module.exports = EvtxListener;