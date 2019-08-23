const MONITOR_TYPE = {//defines the monitor types the program should track.
  LAPTOP: 'Laptop',
  PROJECTOR: 'Projector',
  DESK: 'Desk Monitor',
  forEach: function (func) {//helper to loop through all the monitor types
    for (let key in this) {
      if (this.hasOwnProperty(key) && key !== 'forEach') {
        func(this[key], key);
      }
    }
  }
};

module.exports = MONITOR_TYPE;
