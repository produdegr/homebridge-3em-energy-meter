# Homebridge 3EM Energy Meter Platform

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm version](https://badge.fury.io/js/homebridge-3em-energy-meter.svg)](https://www.npmjs.com/package/homebridge-3em-energy-meter)

A Homebridge platform plugin for monitoring multiple Shelly 3EM and EM energy meters in HomeKit via the EVE app.

## Features

- **Fixed Phase Support**: 3EM devices always use 3 phases, EM devices always use 2 phases
- **Multiple Device Types**: Supports both Shelly 3EM and Shelly EM devices
- **Multiple Device Support**: Monitor multiple devices simultaneously
- **Robust Handling**: Missing phases are automatically set to 0 (no errors)
- **EVE App Integration**: View energy data in the EVE app (required for energy characteristics)
- **History Support**: Historical data with fakegato-history
- **Authentication**: Support for password-protected devices

## Installation

### Standard Installation
```bash
npm install thechris1992/homebridge-shelly-energy-meter
```

### Install a branch #... with Debug Output
```bash
npm install thechris1992/homebridge-shelly-energy-meter#feature/plattform --install-strategy shallow --loglevel verbose
```

**Note**: After installation, restart Homebridge to load the plugin.

## Configuration

Add to your Homebridge config.json platforms section:

```json
{
    "platform": "ShellyEnergyMeter",
    "name": "Energy Meters",
    "devices": [
        {
            "name": "Main House Meter",
            "ip": "192.168.1.100"
        },
        {
            "name": "Garage Meter", 
            "ip": "192.168.1.101",
            "auth": {
                "user": "admin",
                "pass": "password"
            }
        },
        {
            "name": "Solar Meter",
            "ip": "192.168.1.102",
            "device_type": "EM",
            "use_em_mode": 0,
            "debug_log": true
        }
    ]
}
```

### Configuration Options

#### Platform Level
- `platform`: Must be `"ShellyEnergyMeter"`
- `name`: Platform name (shown in logs)
- `devices`: Array of device configurations

#### Device Level
- `name` (required): Device name in HomeKit
- `ip` (required): Device IP address
- `device_type` (optional): Device type - "3EM" (3 phases) or "EM" (2 phases) (default: "3EM")
- `auth` (optional): Authentication credentials
  - `user`: Username
  - `pass`: Password
- `timeout` (optional): HTTP timeout in ms (default: 5000)
- `update_interval` (optional): Update interval in ms (default: 10000)
- `use_em_mode` (optional): EM channel mode (0=all, 1=ch1, 2=ch2) - only for EM devices
- `use_pf` (optional): Use power factor for current calculation (default: false)
- `enable_consumption` (optional): Show instant consumption characteristic (default: true)
- `enable_total_consumption` (optional): Show total energy characteristic (default: true)
- `enable_voltage` (optional): Show voltage characteristic (default: true)
- `enable_ampere` (optional): Show current characteristic (default: true)
- `negative_handling_mode` (optional): Handle negative values (0=zero, 1=absolute)
- `debug_log` (optional): Enable debug logging (default: false)
- `serial` (optional): Custom serial number (auto-generated if empty)

## Notes

- **EVE App Required**: Energy characteristics only visible in EVE app, not native HomeKit
- **Fixed Phase Support**: 3EM always uses 3 phases, EM always uses 2 phases
- **Missing Phases Handled**: If phases are not physically connected, values are set to 0
- **No Phase Configuration**: Phase count is automatically determined by device type
- **Switch Function**: This plugin only handles energy monitoring, not switching
- **Breaking Change**: v2.0.0 converted from accessory to platform plugin

## Troubleshooting

1. **Missing phases**: ✅ **Fixed!** Missing phases are automatically set to 0, no configuration needed
2. **Device not found**: Check IP address and network connectivity
3. **Authentication errors**: Verify username/password
4. **No data**: Ensure update_interval > timeout
5. **Multiple same names**: Use unique device names
6. **Wrong phase count**: Use correct device_type (3EM=3 phases, EM=2 phases)