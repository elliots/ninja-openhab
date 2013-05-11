var stream = require('stream'),
  util = require('util'),
  OpenHABItem = require('./lib/OpenHABItem');

util.inherits(Driver,stream);

module.exports=Driver;

function Driver(opts,app) {

  this._app = app;
  this._opts = opts;
  this._devices = {};

  var self = this;

  this._client  = new (require('request-json').JsonClient)('http://localhost:8080/rest/');

  app.on('client::up',function(){
    self.getItems();
  });

  app.on('client::down',function(){
    clearTimeout(self._timeout);
  });
}

Driver.prototype.getItems = function() { // REMOVE ME! Should be using websockets

    var self = this;

    this._client.get('items', function(err, res, body) {
        if (err) {
            console.warn('Failed to connect to openHAB REST api.', err);
        } else {
            if (!self._timeout) {
                self._timeout = setTimeout(self.getItems, 10000);
            }

            body.item.forEach(function(item) {
                console.log("ITEM! ", item);

                var device = self._devices[item.name] ;

                if (!device) {
                    device = self._devices[item.name] = OpenHABItem.convert(item);

                    if (device) {
                        self.emit('register', device);
                    }
                }

                if (device && item.state !== 'Uninitialized') {
                    device.emitData(item);
                }
            });
        }
    });

};

/*
var WebSocket = require('ws')
  , ws = new WebSocket('ws://localhost:8080/rest/items/Weather_Temperature?type=json');

ws.on('headers', function(headers) {
    headers['X-Atmosphere-Transport'] = 'websocket';
});
ws.on('message', function(message) {
    console.log('received: %s', message);
});

*/
