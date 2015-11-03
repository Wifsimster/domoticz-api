# JavaScript Domoticz API for Node.JS

A Node.JS module, which provides a simplified object oriented wrapper for the Domoticz API.
No properties which begin with uppercase or a multitude of parameters !

This API can determine the specific type of your devices (WallPlug, PowerNode, ...).

## Installation

```shell
      $ npm install domoticz-api      
```

## Usage

Default usage :
```javascript
var Domoticz = require('./api/domoticz');

var api = new Domoticz();
```
Or you can use params :
```javascript
var Domoticz = require('./api/domoticz');

var api = new Domoticz({protocole: "https", host: "192.168.0.20", port: 8080, username: "wifsimster", password: "_password_"});
```

Get an existing device :
```javascript
api.getDevice({
    idx: 134
}, function (error, device) {
    console.log(device);
});
```

Get all devices used :
```javascript
api.getDevices({
    filter: 'all',
    used: 'true',
    order: 'Name'
}, function (error, devices) {
    console.log(devices);
});
```

Get sunrise and sunset :
```javascript
api.getSunriseSunset(function (error, data) {
    console.log(data);
});
```

## Licence

MIT license. See the LICENSE file for details.