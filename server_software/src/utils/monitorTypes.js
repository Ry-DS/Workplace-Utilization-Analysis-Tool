//same as backend, copy of the monitor types
const MONITOR_TYPE = {
  LAPTOP: 'Laptop',
  PROJECTOR: 'Projector',
  DESK: 'Desk Monitor',
  forEach: function (func) {
    for (let key in this) {
      if (this.hasOwnProperty(key) && key !== 'forEach') {
        func(this[key], key);
      }
    }
  }
};

module.exports = MONITOR_TYPE;
