# Change Log

## 2.0.0 (2025-11-05)

### 🚨 BREAKING CHANGES
- **Plugin Type Change**: Converted from accessory plugin to platform plugin to support multiple devices
- **Configuration Update Required**: Existing configurations must be migrated from `accessories` to `platforms` section
- **Removed Legacy Option**: `use_em` configuration option removed - use `device_type` instead

### ✨ New Features
- **Multiple Device Support**: Configure and monitor multiple Shelly 3EM/EM devices simultaneously
- **Fixed Phase Logic**: 3EM devices always use 3 phases, EM devices always use 2 phases (missing phases set to 0)
- **Power Factor Support**: Optional power factor calculation for more accurate current measurement
- **Characteristic Control**: Individual enable/disable options for consumption, voltage, current characteristics
- **Auto-Generated Serial Numbers**: Unique serials generated automatically based on device name and IP
- **Enhanced Device Identification**: Improved logging with device-specific prefixes for better debugging
- **Better Configuration Validation**: Comprehensive validation of device configurations with helpful error messages
- **Modernized Dependencies**: Updated from deprecated `request` to `node-fetch` for better performance

### 🛠️ Improvements
- **Robust Phase Handling**: No more "insufficient emeters" errors - missing phases automatically handled
- **Enhanced Error Handling**: Better error messages and validation for individual devices
- **Improved Logging**: Device-specific logging prefixes for easier troubleshooting in multi-device setups
- **Modern Code Architecture**: Complete code refactoring with async/await patterns
- **Configuration Schema**: Enhanced UI schema with conditional fields and better validation
- **UUID Generation**: Improved UUID generation for unique device identification
- **Homebridge Config UI**: Better integration with configuration interface

### 📋 Migration Guide
**Old Configuration (v1.x)**:
```json
{
    "accessories": [
        {
            "accessory": "3EMEnergyMeter",
            "name": "Energy Meter",
            "ip": "192.168.1.100"
        }
    ]
}
```

**New Configuration (v2.0)**:
```json
{
    "platforms": [
        {
            "platform": "ShellyEnergyMeter",
            "name": "Energy Meters",
            "devices": [
                {
                    "name": "Main House Meter",
                    "ip": "192.168.1.100",
                    "device_type": "3EM"
                },
                {
                    "name": "Solar Meter",
                    "ip": "192.168.1.101",
                    "device_type": "EM",
                    "use_pf": true,
                    "enable_voltage": false,
                    "debug_log": true
                }
            ]
        }
    ]
}
```

### 🔧 New Configuration Options
- `device_type`: "3EM" (3 phases) or "EM" (2 phases)
- `use_pf`: Enable power factor for current calculation
- `enable_consumption`: Show/hide instant consumption characteristic
- `enable_total_consumption`: Show/hide total energy characteristic  
- `enable_voltage`: Show/hide voltage characteristic
- `enable_ampere`: Show/hide current characteristic
- `negative_handling_mode`: Handle negative values (0=zero, 1=absolute)

### 🏗️ Technical Changes
- **Dependency Updates**: Migrated from `request` to `node-fetch` (performance + security)
- **Code Modernization**: Full refactoring with async/await patterns
- **Phase Logic**: Fixed phase count per device type (no more flexible/broken phase detection)
- **Error Handling**: Graceful handling of missing phases and network errors
- **TypeScript Ready**: Better code structure for future TypeScript migration

---

## 1.1.4 (2025-10-03)

### Changes

* Added support for Homebridge V2
* Added a selection for what Energy Data is show
* updated dependencies


## 1.1.3 (2021-05-18)

### Changes

* Added a mode selection in order to specify what to do when negative values appear (Power returns etc.).


## 1.1.2 (2021-11-02)

### Changes

* Added correct absolute ( abs() ) to calculations in order to comply to Homekit ranges (no negative values allowed).

## 1.1.1 (2021-11-02)

### Changes

* Added absolute ( abs() ) to calculations in order to comply to Homekit ranges (no negative values allowed).

## 1.1.0 (2021-08-02)

### Changes

* Added support for Shelly EM devices (beta)
* Please set config flag use_em to true and 
  use use_em_mode to get combined, channel1 or channel2 (setting 0,1,2)
  to use this plugin with a Shelly EM.

## 1.0.0 (2021-06-11)

### Changes

* Bumped stable and tested release to major version 1.0.0
* Just added donation button ;)

## 0.1.3 (2021-04-21)

### Changes

* Added option to use the Power Factor (pf) when calculating Total Ampere.


## 0.1.2 (2021-04-10)

### Changes

* Added returned metered values to debug log.

