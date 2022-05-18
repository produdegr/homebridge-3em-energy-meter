[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm version](https://badge.fury.io/js/homebridge-3em-energy-meter.svg)](https://www.npmjs.com/package/homebridge-3em-energy-meter)
[![Downloads](https://img.shields.io/npm/dt/homebridge-3em-energy-meter.svg)](https://www.npmjs.com/package/homebridge-3em-energy-meter)

# Homebridge 3em Energy Meter

[Homebridge 3em Energy Meter](https://www.npmjs.com/package/homebridge-3em-energy-meter) is a plugin for [Homebridge](https://github.com/homebridge/homebridge) that implements Shelly 3EM energy metering functionality in Homekit.

This plugin uses http requests to a Shelly 3EM (or EM*) device, making it possible to retain the native Shelly cloud statistics (which use MQTT) and at the same time allow you to monitor your energy consumption via Homekit. 

Please note that due to the fact that Apple does not support energy characteristics in Homekit, this plugin's accessory will only show values in the third-party homekit application "EVE".

[![Status](screenshots/homebridge-3em-energy-meter-eve-app.png)]

It will show in the EVE application the following values: Voltage (the average voltage of all 3 phases), Current (the accumulated Ampere of all 3 phases), Consumption (the accumulated Watts of all 3 phases) and the Total Consumption (the accumulated kWh of all 3 phases as calculated by Shelly API. Note in order to reset this value you must reset it in the Shelly app). A Total Cost and Projected Cost will show if you have specified the Energy Cost in the settings section of your EVE application. Total Consumption and Total Cost will feature the fakegato-history graph.

This application uses the cool fakegato plugin ([simont77/fakegato-history](https://github.com/simont77/fakegato-history)).

Please also note that the sole purpose of this plugin is the energy metering feature of the Shelly 3em in order to monitor your 3 phase installation. The Shelly 3em features also an actuator (switch) which is not implemented in this plugin. If you need to use the switch in Homekit please use other plugins, like for example the very good homebridge-shelly ([alexryd/homebridge-shelly](https://github.com/alexryd/homebridge-shelly)) plugin.

# Installation Instructions

You can easily install this plugin by using the superb [Homebridge Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x). Search for "homebridge-3em-energy-meter" in the "Plugins" tab and install the plugin. After that fill out the configuration by using the "SETTINGS" link below the installed plugin.

Alternatively, can you install the plugin by 

             npm install -g homebridge-3em-energy-meter

and then edit your Homebridge's config.json to include the following in the accessories section:

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
            "use_em": false,
            "use_em_mode": 0,
            "negative_handling_mode": 0,
            "use_pf": false,
            "debug_log": false,
            "serial": "123456789012345"             
        },

* "name"              			The Homekit Accessory Name.
* "ip"                			The IP address of your Shelly 3EM.
* "user" and "pass"   			If your Shelly 3EM local web page is password protected specify "user" and "pass".
* "timeout"           			The http/get request timeout in msec. This timeout must the less than the "update_interval", default is 5000.
* "update_interval"   			The interval for pulling values in msec. Must be greater than "timeout" setting, default is 10000.
* "use_em"            			Use this plugin with a Shelly EM device.
* "use_em_mode" 						Set the mode when use_em is true. Set to 0 to combine channel1 and channel2. Use 1,2 when single channels should be used,respectively.
* "use_pf"            			Enables the Power Factor (pf) usage when calculating Total Ampere.
* "negative_handling_mode"	Defines what happens with negative values. Set to 0 to zero them or 1 to show them as absolute values.
* "debug_log"         			Enables the debug logging of the plugin, default is false.
* "serial"            			This sets the published serialNumber of the accessory. It is required to use an unique serial for fakegato-history to work correctly.

Shelly EM functionality is beta, please use at own risk as I could not test it on a real EM device.
The creator of this plugin is not affiliated in any way with [Shelly(Allterco)](https://shelly.cloud/) or [EVE](https://www.evehome.com/).

[![Support via PayPal](https://cdn.rawgit.com/twolfson/paypal-github-button/1.0.0/dist/button.svg)](https://www.paypal.me/produdegr/)
