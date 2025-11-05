const fetch = require('node-fetch');
const fakegatoHistory = require('fakegato-history');
const { version } = require('./package.json');

let Service, Characteristic, PlatformAccessory, FakeGatoHistoryService;
const POWER_METER_SERVICE_UUID = '00000001-0000-1777-8000-775D67EC4377';

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	PlatformAccessory = homebridge.platformAccessory;

	// Register Eve characteristics
	registerEveCharacteristics();

	// Initialize FakeGato with the homebridge instance
	FakeGatoHistoryService = fakegatoHistory(homebridge);
	
	homebridge.registerPlatform("homebridge-shelly-energy-meter", "ShellyEnergyMeter", EnergyMeterPlatform);
}

function registerEveCharacteristics() {
	// Eve Power Consumption (Watts)
	global.EvePowerConsumption = class extends Characteristic {
		constructor() {
			super('Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
			this.setProps({
				format: Characteristic.Formats.UINT16,
				unit: "Watts",
				maxValue: 100000,
				minValue: 0,
				minStep: 1,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		}
	};
	global.EvePowerConsumption.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

	// Eve Total Consumption (kWh)
	global.EveTotalConsumption = class extends Characteristic {
		constructor() {
			super('Energy', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
			this.setProps({
				format: Characteristic.Formats.FLOAT,
				unit: 'kWh',
				maxValue: 1000000000,
				minValue: 0,
				minStep: 0.001,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		}
	};
	global.EveTotalConsumption.UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52';

	// Eve Voltage
	global.EveVoltage = class extends Characteristic {
		constructor() {
			super('Volt', 'E863F10A-079E-48FF-8F27-9C2605A29F52');
			this.setProps({
				format: Characteristic.Formats.FLOAT,
				unit: 'Volt',
				maxValue: 1000000000,
				minValue: 0,
				minStep: 0.001,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		}
	};
	global.EveVoltage.UUID = 'E863F10A-079E-48FF-8F27-9C2605A29F52';

	// Eve Current
	global.EveAmpere = class extends Characteristic {
		constructor() {
			super('Ampere', 'E863F126-079E-48FF-8F27-9C2605A29F52');
			this.setProps({
				format: Characteristic.Formats.FLOAT,
				unit: 'Ampere',
				maxValue: 1000000000,
				minValue: 0,
				minStep: 0.001,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		}
	};
	global.EveAmpere.UUID = 'E863F126-079E-48FF-8F27-9C2605A29F52';

	// Eve Power Meter Service
	global.PowerMeterService = class extends Service {
		constructor(displayName, subtype) {
			super(displayName, POWER_METER_SERVICE_UUID, subtype);
			this.addOptionalCharacteristic(global.EvePowerConsumption);
			this.addOptionalCharacteristic(global.EveTotalConsumption);
			this.addOptionalCharacteristic(global.EveVoltage);
			this.addOptionalCharacteristic(global.EveAmpere);
		}
	};
	global.PowerMeterService.UUID = POWER_METER_SERVICE_UUID;
}

function EnergyMeterPlatform(log, config, api) {
	this.log = log;
	this.config = config || {};
	this.api = api;
	this.accessories = [];

	if (!this.config.devices || !Array.isArray(this.config.devices)) {
		this.log.warn('No devices configured or invalid configuration');
		return;
	}

	if (api) {
		api.on('didFinishLaunching', () => this.discoverDevices());
	}
}

EnergyMeterPlatform.prototype.configureAccessory = function(accessory) {
	this.accessories.push(accessory);
}

EnergyMeterPlatform.prototype.discoverDevices = function() {
	for (let i = 0; i < this.config.devices.length; i++) {
		const device = this.config.devices[i];
		
		// Validate device config
		if (!device.name || !device.ip) {
			this.log.error(`Device ${i + 1} missing name or ip`);
			continue;
		}

		const uuid = this.api.hap.uuid.generate(`${device.name}-${device.ip}`);
		const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

		if (existingAccessory) {
			this.log.info(`Updating existing accessory: ${device.name}`);
			existingAccessory.context.device = device;
			new EnergyMeter(this.log, device, existingAccessory, this.api);
			this.api.updatePlatformAccessories([existingAccessory]);
		} else {
			this.log.info(`Adding new accessory: ${device.name}`);
			const accessory = new PlatformAccessory(device.name, uuid);
			accessory.context.device = device;
			new EnergyMeter(this.log, device, accessory, this.api);
			this.api.registerPlatformAccessories('homebridge-shelly-energy-meter', 'ShellyEnergyMeter', [accessory]);
			this.accessories.push(accessory);
		}
	}

	// Remove obsolete accessories
	const currentUUIDs = this.config.devices.map((device, i) => 
		this.api.hap.uuid.generate(`${device.name}-${device.ip}`)
	);
	const obsoleteAccessories = this.accessories.filter(acc => !currentUUIDs.includes(acc.UUID));
	
	if (obsoleteAccessories.length > 0) {
		this.log.info(`Removing ${obsoleteAccessories.length} obsolete accessory(ies)`);
		this.api.unregisterPlatformAccessories('homebridge-shelly-energy-meter', 'ShellyEnergyMeter', obsoleteAccessories);
		this.accessories = this.accessories.filter(acc => currentUUIDs.includes(acc.UUID));
	}
}

function EnergyMeter(log, config, accessory, api) {
	this.log = log;
	this.config = config;
	this.accessory = accessory;
	this.api = api;
	this.name = config.name;
	this.ip = config.ip;
	this.updateInterval = config.update_interval || 10000;
	this.timeout = config.timeout || 5000;
	
	// Device type determination
	this.deviceType = config.device_type || '3EM'; // Default to 3EM if not specified
	
	// Fixed phase configuration based on device type
	this.connectedPhases = this.deviceType === 'EM' ? 2 : 3;
	this.enabledPhases = Array.from({length: this.connectedPhases}, (_, i) => i + 1);
	
	if (this.debugLog) {
		this.log.info(`[${this.name}] Device: ${this.deviceType}, Fixed phases: ${this.connectedPhases} (${this.enabledPhases.join(', ')})`);
	}
	
	// EM specific configuration
	this.emMode = config.use_em_mode || 0;
	
	this.auth = config.auth;
	this.debugLog = config.debug_log || false;
	
	// New configuration options
	this.usePowerFactor = config.use_pf || false;
	this.enableConsumption = config.enable_consumption !== false; // Default true
	this.enableTotalConsumption = config.enable_total_consumption !== false; // Default true
	this.enableVoltage = config.enable_voltage !== false; // Default true
	this.enableAmpere = config.enable_ampere !== false; // Default true
	
	// Current values
	this.power = 0;
	this.totalEnergy = 0;
	this.voltage = 0;
	this.current = 0;
	
	if (this.debugLog) {
		this.log.info(`[${this.name}] Initialized ${this.deviceType} with ${this.connectedPhases} connected phase(s)`);
	}
	
	this.setupServices();
	this.startUpdating();
}

EnergyMeter.prototype.setupServices = function() {
	// Information Service
	const informationService = this.accessory.getService(Service.AccessoryInformation) ||
		this.accessory.addService(Service.AccessoryInformation);
	
	informationService
		.setCharacteristic(Characteristic.Manufacturer, "Shelly")
		.setCharacteristic(Characteristic.Model, `Shelly ${this.deviceType}`)
		.setCharacteristic(Characteristic.SerialNumber, this.config.serial || `${this.deviceType}-${this.ip.replace(/\./g, '')}`)
		.setCharacteristic(Characteristic.FirmwareRevision, version);

	// Power Meter Service - use device IP as unique subtype for persistence
	const serviceSubtype = this.ip;
	const existingService = (this.accessory.services || []).find(service =>
		service && service.UUID === POWER_METER_SERVICE_UUID && service.subtype === serviceSubtype
	);

	if (existingService) {
		this.service = existingService;
		// Ensure name stays up to date when accessory name changes
		this.service.displayName = this.name;
		this.service.setCharacteristic(Characteristic.Name, this.name);
		if (this.debugLog) {
			this.log.info(`[${this.name}] Reusing existing PowerMeter service with subtype: ${serviceSubtype}`);
		}
	} else {
		this.service = this.accessory.addService(global.PowerMeterService, this.name, serviceSubtype);
		if (this.debugLog) {
			this.log.info(`[${this.name}] Created new PowerMeter service with subtype: ${serviceSubtype}`);
		}
	}

	// Clean up duplicate characteristics that may linger from previous versions
	this.removeDuplicateCharacteristics();

	// Clean up characteristics that are no longer needed
	if (!this.enableConsumption) {
		this.removeCharacteristicIfExists(global.EvePowerConsumption);
	}
	if (!this.enableTotalConsumption) {
		this.removeCharacteristicIfExists(global.EveTotalConsumption);
	}
	if (!this.enableVoltage) {
		this.removeCharacteristicIfExists(global.EveVoltage);
	}
	if (!this.enableAmpere) {
		this.removeCharacteristicIfExists(global.EveAmpere);
	}

	// Add characteristics based on configuration
	if (this.enableConsumption) {
		this.powerChar = this.ensureCharacteristic(global.EvePowerConsumption);
		this.powerChar.removeAllListeners('get');
		this.powerChar.on('get', callback => callback(null, this.power));
	}
	
	if (this.enableTotalConsumption) {
		this.totalEnergyChar = this.ensureCharacteristic(global.EveTotalConsumption);
		this.totalEnergyChar.removeAllListeners('get');
		this.totalEnergyChar.on('get', callback => callback(null, this.totalEnergy));
	}
	
	if (this.enableVoltage) {
		this.voltageChar = this.ensureCharacteristic(global.EveVoltage);
		this.voltageChar.removeAllListeners('get');
		this.voltageChar.on('get', callback => callback(null, this.voltage));
	}
	
	if (this.enableAmpere) {
		this.currentChar = this.ensureCharacteristic(global.EveAmpere);
		this.currentChar.removeAllListeners('get');
		this.currentChar.on('get', callback => callback(null, this.current));
	}

	// Initialize history service for Eve app
	this.setupHistory();
}

EnergyMeter.prototype.ensureCharacteristic = function(characteristicClass) {
	const uuid = characteristicClass.UUID;
	let characteristic = this.service.characteristics.find(char => char.UUID === uuid);
	if (!characteristic) {
		characteristic = this.service.addCharacteristic(characteristicClass);
	}
	return characteristic;
};

EnergyMeter.prototype.removeCharacteristicIfExists = function(characteristicClass) {
	const uuid = characteristicClass.UUID;
	const matches = this.service.characteristics.filter(char => char.UUID === uuid);
	matches.forEach(char => this.service.removeCharacteristic(char));
};

EnergyMeter.prototype.removeDuplicateCharacteristics = function() {
	const seen = new Map();
	// clone array because we mutate characteristics during iteration
	for (const char of [...this.service.characteristics]) {
		if (!seen.has(char.UUID)) {
			seen.set(char.UUID, char);
			continue;
		}
		this.service.removeCharacteristic(char);
		if (this.debugLog) {
			this.log.info(`[${this.name}] Removed duplicate characteristic with UUID ${char.UUID}`);
		}
	}
};

EnergyMeter.prototype.setupHistory = function() {
	if (!FakeGatoHistoryService) {
		this.log.warn(`[${this.name}] History service unavailable - FakeGato not initialized`);
		return;
	}
	// Initialize history service when first needed
	if (this.historyService === undefined) {
		try {
			// Use setTimeout to delay initialization until all APIs are loaded
			setTimeout(() => {
				try {
					this.historyService = new FakeGatoHistoryService("energy", this.accessory, {
						storage: 'fs',
						log: this.log
					});
					if (this.debugLog) {
						this.log.info(`[${this.name}] History service initialized successfully`);
					}
				} catch (error) {
					this.log.warn(`[${this.name}] Failed to initialize history service: ${error.message}`);
					this.historyService = null;
				}
			}, 1000); // 1 second delay
			
			// Set to null temporarily to prevent multiple attempts
			this.historyService = null;
		} catch (error) {
			this.log.warn(`[${this.name}] Failed to setup history service: ${error.message}`);
			this.historyService = null;
		}
	}
}

EnergyMeter.prototype.startUpdating = function() {
	if (this.updateInterval > 0) {
		setInterval(() => this.updateValues(), this.updateInterval);
		this.updateValues(); // Initial update
	}
}

EnergyMeter.prototype.updateValues = async function() {
	try {
		const url = `http://${this.ip}/status/emeters`;
		const options = {
			method: 'GET',
			timeout: this.timeout
		};

		if (this.auth) {
			const auth = Buffer.from(`${this.auth.user}:${this.auth.pass}`).toString('base64');
			options.headers = { 'Authorization': `Basic ${auth}` };
		}

		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		this.processData(data);

	} catch (error) {
		this.log.error(`[${this.name}] Update failed: ${error.message}`);
	}
}

EnergyMeter.prototype.processData = function(data) {
	if (!data.emeters || !Array.isArray(data.emeters)) {
		this.log.error(`[${this.name}] Invalid data format`);
		return;
	}

	const emeters = data.emeters;
	const availablePhases = emeters.length;
	
	// Always use fixed phase count, missing phases will be 0
	let power = 0, totalEnergy = 0, voltage = 0, current = 0;
	let validPhases = 0;

	if (this.deviceType === 'EM') {
		// Shelly EM processing - always process 2 phases
		switch (this.emMode) {
			case 1: // Channel 1 only
				const phase1 = emeters[0] || {};
				power = this.safeFloat(phase1.power);
				totalEnergy = this.safeFloat(phase1.total) / 1000;
				voltage = this.safeFloat(phase1.voltage);
				const pf1 = this.safeFloat(phase1.pf) || 1.0;
				current = this.calculateCurrent(power, voltage, pf1);
				validPhases = 1;
				break;
			case 2: // Channel 2 only
				const phase2 = emeters[1] || {};
				power = this.safeFloat(phase2.power);
				totalEnergy = this.safeFloat(phase2.total) / 1000;
				voltage = this.safeFloat(phase2.voltage);
				const pf2 = this.safeFloat(phase2.pf) || 1.0;
				current = this.calculateCurrent(power, voltage, pf2);
				validPhases = 1;
				break;
			default: // Combined channels - always process both phases
				let totalPowerFactor = 0;
				for (let i = 0; i < 2; i++) { // Always 2 phases for EM
					const phase = emeters[i] || {}; // Use empty object if phase missing
					power += this.safeFloat(phase.power);
					totalEnergy += this.safeFloat(phase.total);
					voltage += this.safeFloat(phase.voltage);
					totalPowerFactor += this.safeFloat(phase.pf) || 1.0;
					validPhases++;
				}
				if (validPhases > 0) {
					totalEnergy = totalEnergy / 1000;
					voltage = voltage / validPhases; // Average voltage
					const avgPowerFactor = totalPowerFactor / validPhases; // Average power factor
					current = this.calculateCurrent(power, voltage, avgPowerFactor);
				}
		}
	} else {
		// Shelly 3EM processing - always process 3 phases
		for (let i = 0; i < 3; i++) { // Always 3 phases for 3EM
			const phase = emeters[i] || {}; // Use empty object if phase missing
			power += this.safeFloat(phase.power);
			totalEnergy += this.safeFloat(phase.total);
			voltage += this.safeFloat(phase.voltage);
			current += this.safeFloat(phase.current);
			validPhases++;
		}
		// Calculate averages where appropriate
		if (validPhases > 0) {
			totalEnergy = totalEnergy / 1000; // Convert to kWh
			voltage = voltage / validPhases; // Average voltage
			// Power and current are already summed
		}
	}

	// Handle negative values
	if (this.config.negative_handling_mode === 1) {
		power = Math.abs(power);
		totalEnergy = Math.abs(totalEnergy);
		voltage = Math.abs(voltage);
		current = Math.abs(current);
	} else {
		power = Math.max(0, power);
		totalEnergy = Math.max(0, totalEnergy);
		voltage = Math.max(0, voltage);
		current = Math.max(0, current);
	}

	// Update values
	this.power = power;
	this.totalEnergy = totalEnergy;
	this.voltage = voltage;
	this.current = current;

	// Update characteristics (only if enabled)
	if (this.powerChar) this.powerChar.updateValue(this.power);
	if (this.totalEnergyChar) this.totalEnergyChar.updateValue(this.totalEnergy);
	if (this.voltageChar) this.voltageChar.updateValue(this.voltage);
	if (this.currentChar) this.currentChar.updateValue(this.current);

	// Add to history (if available)
	if (this.historyService) {
		this.historyService.addEntry({
			time: Math.round(Date.now() / 1000),
			power: this.power
		});
	}

	if (this.debugLog) {
		this.log.info(`[${this.name}] Updated (${validPhases} phases): ${this.power}W, ${this.totalEnergy}kWh, ${this.voltage}V, ${this.current}A`);
	}
}

EnergyMeter.prototype.safeFloat = function(value) {
	const parsed = parseFloat(value);
	return isNaN(parsed) ? 0 : parsed;
}

EnergyMeter.prototype.calculateCurrent = function(power, voltage, powerFactor = 1.0) {
	if (voltage <= 0) return 0;
	
	if (this.usePowerFactor && powerFactor > 0) {
		// I = P / (V * pf) - More accurate for AC with reactive loads
		return power / (voltage * powerFactor);
	} else {
		// I = P / V - Simple calculation (resistive loads only)
		return power / voltage;
	}
}