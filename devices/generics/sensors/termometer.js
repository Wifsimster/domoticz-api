"use strict";

var Device = require('../device');

class Termometer extends Device.Device {
    constructor(value) {
        super();
        this.value = value;
        this.unity = "C";
    }
}

module.exports.Termometer = Termometer;