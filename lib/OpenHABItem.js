var stream = require('stream'),
  util = require('util');

util.inherits(Device,stream);

module.exports=Device;

function Device(item, D, toState, fromState) {

  var self = this;

  this.writeable = false; // TODO: make writable!
  this.readable = true;
  this.V = 0;
  this.D = D;
  this.G = 'openhab' + item.name.replace(/[^0-9a-zA-Z]/g, '');

  this.name = item.name;
  this.default_name = item.name;

  this.toState = toState;
  this.fromState = fromState;

  process.nextTick(function() {
    self.emitData(item);
  });
}

Device.prototype.emitData = function(item) {
  this.emit('data', this.toState(item));
};

module.exports.convert = function(item) {
    switch (item.type) {
        case 'SwitchItem':
            var isLight = item.name.toLowerCase().indexOf('light') > -1;

            return new Device(item, isLight? 233 : 207, function(item) {
                return item.state == 'ON'?'1':'0';
            }, function(state) {
                return state === '1'?'ON':'OFF';
            });
        case 'NumberItem':
            var isTemperature = item.name.toLowerCase().indexOf('temp') > -1;

            return new Device(item, isTemperature? 9 : 2000, function(item) {
                return item.state;
            }, function(state) {
                return state;
            });
        default:
            console.warn('Unknown openHAB device type : ' + item.type);
            return null;
    }
};




