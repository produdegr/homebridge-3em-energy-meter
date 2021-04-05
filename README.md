# Homebridge 3em Energy Meter

[Homebridge 3em Energy Meter](https://www.npmjs.com/package/homebridge-3em-energy-meter) is a plugin for [Homebridge](https://github.com/homebridge/homebridge) that implements Shelly 3EM energy metering functionality in Homekit.

This plugin uses http requests to a Shelly 3EM device, making it possible to retain the native Shelly cloud statistics (which use MQTT) and at the same time allow you to monitor your energy consumption via Homekit. 

Due to the fact that Apple does not support energy characteristics in Homekit, this plugin's accessory will only show values in the third-party homekit application "EVE".

[![Status](screenshots/homebridge-3em-energy-meter-eve-app.png)]

It will show in the EVE application the following values: Voltage (the average voltage of all 3 phases), Current (the accumulated Ampere of all 3 phases), Consumption (the accumulated Watts of all 3 phases) and the Total Consumption (the accumulated kWh of all 3 phases as calculated by Shelly API. Note in order to reset this value you must reset it in the Shelly app). A Total Cost and Projected Cost will show if you have specified the Energy Cost in the settings section of your EVE application. Total Consumption and Total Cost will feature the fakegato-history graph.

This application uses the cool fakegato plugin (simont77/fakegato-history).

Below an example config which needs to be added to the accessories section of your Homebridge's config.json:

        {
            "accessory": "3EMEnergyMeter",
            "name": "Energy Meter",
            "ip": "192.168.0.1",
            "auth": {
                "user": "",
                "pass": ""
            },
            "timeout": 5000,
            "update_interval": 10000,
            "debug_log": false,
            "serial": "123456789012345"             
        },

-"name"              The Homekit Accessory Name.
-"ip"                The IP address of your Shelly 3EM.
-"user" and "pass"   If your Shelly 3EM local web page is password protected specify "user" and "pass".
-"timeout"           The http/get request timeout in msec. This timeout must the less than the "update_interval", default is 5000.
-"update_interval"   The interval for pulling values in msec. Must be greater than "timeout" setting, default is 10000.
-"debug_log"         Enables the debug logging of the plugin, default is false.
-"serial"            This sets the published serialNumber of the accessory. It is required to use an unique serial for fakegato-history to work correctly.


