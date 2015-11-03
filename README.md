# JavaScript Domoticz API for Node.JS

A Node.JS module, which provides a simplified object oriented wrapper for the Domoticz API.

## Installation

```shell
      $ npm install domoticz-api      
```

## Documentation

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



## LICENSE

MIT license. See the LICENSE file for details.