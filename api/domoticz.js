//'use strict';

var request = require('request');
var _ = require('lodash');
var URI = require('urijs');
var extend = require('extend');

// Sensors
var Barometer = require('./../devices/generics/sensors/barometer');
var Carboxymeter = require('./../devices/generics/sensors/carboxymeter');
var Hygrometer = require('./../devices/generics/sensors/hygrometer');
var Luxometer = require('./../devices/generics/sensors/luxometer');
var Sonometer = require('./../devices/generics/sensors/sonometer');
var Termometer = require('./../devices/generics/sensors/thermometer');

// Utility
var Consumption = require('./../devices/generics/utility/consumption');
var Power = require('./../devices/generics/utility/power');
var Usage = require('./../devices/generics/utility/usage');

function Domoticz(options) {
    if (!(this instanceof Domoticz)) return new Domoticz(options);
    this.options = {
        protocol: 'http',
        host: '127.0.0.1',
        port: '80',
        username: undefined,
        password: undefined
    };
    this.options = extend(this.options, options);
}

/**
 * Generate the default url for your Domoticz API
 * @returns {*|exports|module.exports}
 * @private
 */
Domoticz.prototype._getUrl = function () {
    return new URI({
        protocol: this.options.protocol,
        hostname: this.options.host,
        port: this.options.port,
        path: "/json.htm",
        username: this.options.username,
        password: this.options.password
    });
};

/**
 * Check if the request goes well
 * Lower case two first letters of each property in data result
 * @param url
 * @param callback
 * @private
 */

//data = req.query.json;
//var stringify = JSON.stringify(data)
//content = JSON.parse(stringify);

Domoticz.prototype._request = function (url, callback) {
    var self = this;


    request(url.toString(), function (error, res, data) {
    //next line new
   // var stringify = JSON.stringify(data)
 //	callback(error, self._toLowerCaseResult(JSON.parse(stringify)));
  	callback(error, self._toLowerCaseResult(JSON.parse(data)));
    });
};

/**
 * Lower case the first two characters of each data property and rename result by results
 * @param jsonData
 * @returns {{}}
 * @private
 */
Domoticz.prototype._toLowerCaseResult = function (jsonData) {
    var newObj = {};
    _.each(jsonData, function (value, name) {
        newObj[name.charAt(0).toLowerCase() + name.charAt(1).toLowerCase() + name.slice(2)] = value;
        if (name === "result") {
            var newDevices = [];
            // Each device in result
            _.each(value, function (device) {
                // Each property of a device
                var newDevice = {};
                _.each(device, function (deviceValue, deviceName) {
                    newDevice[deviceName.charAt(0).toLowerCase() + deviceName.charAt(1).toLowerCase() + deviceName.slice(2)] = deviceValue;
                });
                newDevices.push(newDevice);
            });
            newObj['results'] = newDevices;
            delete newObj.result;
        }
    });
    return newObj;
}

/**
 * Get a device info by `idx`
 * @param idx
 * @param callback
 */
Domoticz.prototype.getDevice = function (param, callback) {
    var url = this._getUrl();
    url.addSearch("type", "devices");
    url.addSearch("rid", param.idx);
    console.log(url.toString());
    this._request(url, callback);
};

/**
 * Get all devices with params (`filter`, `used`, `order`)
 * @param _params
 * @param callback
 */
Domoticz.prototype.getDevices = function (_params, callback) {
    var params = {
        filter: 'all',  // Can also be `light`, `weather`, `temperature`, `utility`
        used: true,
        order: 'Name'
    };
    params = extend(params, _params);

    var url = this._getUrl();
    url.addSearch("type", "devices");

    // Add potential filters
    params["filter"] != undefined && _.isString(params["filter"]) ? _.contains(['all', 'light', 'weather', 'temperature', 'utility'], params["filter"]) ? url.addSearch("filter", params["filter"]) : this : this;
    params["used"] != undefined && _.isBoolean(params["used"]) ? params["used"] ? url.addSearch("used", 'true') : url.addSearch("used", 'false') : this;
    params["order"] != undefined && _.isString(params["order"]) ? url.addSearch("order", params["order"]) : this;
    params["plan"] != undefined && _.isNumber(params["plan"]) ? url.addSearch("plan", params["plan"]) : this;

    this._request(url, callback);
};

/*

Params must be
 *	`idx`: your device idx
*	`value`: temp - accepts Float
*/
Domoticz.prototype.uTemp = function (params, callback) {
        var url = this._getUrl();
        url.addSearch("type", "command");
        url.addSearch("param", 'udevice');
        url.addSearch("idx", params.idx);
        url.addSearch("nvalue", '0');
        url.addSearch("svalue", params.value)
        this._request(url, callback);
}

/**
 * Get sunrise and sunset times
 * @param callback
 */
Domoticz.prototype.getSunriseSunset = function (callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", "getSunRiseSet");
    this._request(url, callback);
};

/**
 * Change state of a switch or a dimmable
 * Params must be
 *      `type` : 'switch' or 'dimmable'
 *      `idx`: your device idx
 *      `state` : 'on', 'off', 'toggle' or a percentage for a type dimmable (int from 0 to 100)
 * @param params
 * @param callback
 */
Domoticz.prototype.changeSwitchState = function (params, callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("idx", params.idx);
    params.type === 'switch' ? url.addSearch("param", 'switchlight') : this;
    params.type === 'dimmable' ? params.state = 'Set%20Level&level=' + parseInt((parseInt(params.state) / 100) * 16) : this;
    params.state === 'toggle' ? params.state = 'Toggle' : this;
    params.state === 'on' ? params.state = 'On' : this;
    params.state === 'off' ? params.state = 'Off' : this;
    url.addSearch("switchcmd", params.state);
    this._request(url, callback);
};

/**
 * Get all the scenes and groups
 * @param callback
 */
Domoticz.prototype.getScenesGroups = function (callback) {
    var url = this._getUrl();
    url.addSearch("type", "scenes");
    this._request(url, callback);
};

/**
 * Change state of a scene or a group
 * Params must be
 *      `idx`: your device idx
 *      `state` : 'on' or 'off'
 * By design, scenes can only turn on !
 * @param params
 * @param callback
 */
Domoticz.prototype.changeSceneState = function (params, callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'switchscene');
    url.addSearch("idx", params.idx);
    params.state === 'on' ? params.state = 'On' : this;
    params.state === 'off' ? params.state = 'Off' : this;
    url.addSearch("switchcmd", params.state);
    this._request(url, callback);
};

/**
 * Get a user variable by `idx`
 * @param param
 * @param callback
 */
Domoticz.prototype.getVariable = function (param, callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'getuservariable');
    url.addSearch("idx", param.idx);
    this._request(url, callback);
};

/**
 * Get all user variables
 * @param callback
 */
Domoticz.prototype.getVariables = function (callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'getuservariables');
    this._request(url, callback);
};

/**
 * Store a new variable in Domoticz
 * Params are :
 *      `name` : name of the user variable
 *      `type` : type of the user variable, can be Integer, Float, String, Date in format DD/MM/YYYY or Time in 24 hr format HH:MM
 *      `value` : value of the user variable
 * @param params
 * @param callback
 */
Domoticz.prototype.addVariable = function (params, callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'saveuservariable');
    url.addSearch("vname", params.name);
    url.addSearch("vtype", params.type);
    url.addSearch("vvalue", params.value);
    this._request(url, callback);
};

/**
 * Update an existing variable in Domoticz by idx
 * Params are :
 *      `idx` : idx of the user variable
 *      `name` : new name of the user variable
 *      `type` : new type of the user variable, can be Integer, Float, String, Date in format DD/MM/YYYY or Time in 24 hr format HH:MM
 *      `value` : new value of the user variable
 * @param params
 * @param callback
 */
Domoticz.prototype.updateVariable = function (params, callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'updateuservariable');
    url.addSearch("idx", params.idx);
    url.addSearch("vname", params.name);
    url.addSearch("vtype", params.type);
    url.addSearch("vvalue", params.value);
    this._request(url, callback);
};

/**
 * Delete an existing variable in Domoticz by idx
 * Params are :
 *      `idx` : idx of the user variable
 * @param params
 * @param callback
 */
Domoticz.prototype.removeVariable = function (params, callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'deleteuservariable');
    url.addSearch("idx", params.idx);
    this._request(url, callback);
};

/**
 * Shutdown you Domoticz system
 * @param callback
 */
Domoticz.prototype.shutdownSystem = function (callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'system_shutdown');
    this._request(url, callback);
};

/**
 * Reboot your Domoticz system
 * @param callback
 */
Domoticz.prototype.rebootSystem = function (callback) {
    var url = this._getUrl();
    url.addSearch("type", "command");
    url.addSearch("param", 'system_reboot');
    this._request(url, callback);
};

/**
 * Get all plans
 * @param callback
 */
Domoticz.prototype.getPlans = function (callback) {
    var url = this._getUrl();
    url.addSearch("type", "plans");
    this._request(url, callback);
};

/**
 * Determine and return the generic type of a device
 * @param device
 * @returns {*}
 */
Domoticz.prototype.getGenericType = function (device) {
    if (_.isObject(device)) {
        if (device.hardwareName === "Motherboard") return ['Usage'];
        if (device.hardwareName === "Netatmo Weather Station") {
            if (device.subType === 'Voltcraft CO-20') return ['Carboxymeter'];
            if (device.subType === 'Sound Level') return ['Sonometer'];
            if (device.subType === 'WTGR800') return ['Thermometer', 'Hygrometer'];
            if (device.type === 'Temp + Humidity + Baro') return ['Thermometer', 'Hygrometer', 'Barometer'];
            return ['NetatmoWeatherStation'];
        }
        if (device.type === "Temp") return ['Temperature'];
        if (device.type === "Lighting 1" || device.type === "Lighting 2") {
            if (device.subType === 'ZWave' && device.switchType === 'Motion Sensor') return ['MotionSensor'];
            return ['Switch'];
        }
        if (device.type === "General" && device.subType === "kWh") return ['Consumption'];
        if (device.type === "Usage" && device.subType === "Electric") return ['Power'];
        if (device.type === "Lux" && device.subType === "Lux") return ['Luxometer'];

        // If type not found return the device data
        return device;
    }
}

/**
 * Return an array of unique value
 * @param array
 * @returns {*}
 * @private
 */
Domoticz._filter = function (array) {
    return array.filter(function (elem, pos) {
        return array.indexOf(elem) == pos;
    });
};

/**
 * Return an array of unique nodeIDs for OpenZWave devices
 * @param devices
 * @returns {*}
 * @private
 */
Domoticz._getNodeIDs = function (devices) {
    var nodeIds = [];
    devices.forEach(function (device) {
        if (device.subType === "ZWave") {
            nodeIds.push(device.id.substring(0, 5));
        }
    });
    return Domoticz._filter(nodeIds);
}

Domoticz._getNodeIdStart = function (device) {
    if (device.subType === "ZWave") return device.id.substring(0, 5);
}

/**
 * Get the number of siblings an OpenZWave has
 * @param device
 */
Domoticz.prototype.getNumberSiblings = function (device, callback) {
    if (_.isObject(device) && device.subType === "ZWave") {
        //console.log(device.id)
        this.getDevices({
            filter: 'all',
            used: 'true',
            order: 'Name'
        }, function (error, data) {
            var count = 0;
            data.results.map(function (_device) {
                if (_device.subType === "ZWave")
                    if (Domoticz._getNodeIdStart(device) === Domoticz._getNodeIdStart(_device))
                        count++;
            });
            callback(count);
        });
    } else {
        callback(0);
    }
}

module.exports = Domoticz;