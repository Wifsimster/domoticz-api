var Domoticz = require('./api/domoticz');

var api = new Domoticz({host: '192.168.0.21', port: 8087});

// OK
api.getDevice({
    idx: 134
}, function (error, device) {
    console.log(device);
});

// OK
//api.getDevices({
//    filter: 'all',
//    used: 'true',
//    order: 'Name'
//}, function (error, devices) {
//    console.log(devices);
//});

// OK
//api.getSunriseSunset(function (error, data) {
//    console.log(data);
//});