import { WeatherData, WeatherModule } from '../model/weather-data';
import { Device, Module, NetatmoWeatherStationData } from './types';

export function parseStationData(data: NetatmoWeatherStationData, timestamp: number): WeatherData[] {
  const weatherDatas: WeatherData[] = [];

  for (const device of data.devices) {
    const weatherData = parseDevice(device, timestamp);
    weatherDatas.push(weatherData);
  }

  return weatherDatas;
}

function parseDevice(device: Device, timestamp: number): WeatherData {
  const weatherData: WeatherData = {
    timestamp,
    stationId: device._id,
    stationName: device.station_name,
    modules: []
  };

  const deviceModule = deviceToModule(device, timestamp);
  const modules = [deviceModule, ...device.modules];

  for (const netatmoModule of modules) {
    const parsedModule = parseModule(netatmoModule);
    weatherData.modules.push(parsedModule);
  }

  return weatherData;
}

function deviceToModule(device: Device, timestamp: number): Module {
  const deviceModule = {
    _id: device._id,
    last_message: timestamp,
    last_seen: timestamp,
    dashboard_data: device.dashboard_data,
    data_type: device.data_type,
    module_name: device.module_name
  };

  return deviceModule;
}

function parseModule(netatmoModule: Module): WeatherModule {
  const weatherModule: WeatherModule = {
    moduleId: netatmoModule._id,
    moduleName: netatmoModule.module_name,
    lastContact: Math.max(netatmoModule.last_message, netatmoModule.last_seen)
  };

  const data = netatmoModule.dashboard_data;

  if (data.Humidity != undefined) {
    weatherModule.humidity = data.Humidity;
  }

  if (data.Noise != undefined) {
    weatherModule.noise = data.Noise;
  }

  if (data.Rain != undefined) {
    weatherModule.rain = data.Rain;
  }

  if (data.WindStrength != undefined) {
    weatherModule.windSpeed = data.WindStrength;
  }

  if (data.Temperature != undefined) {
    weatherModule.temperature = data.Temperature;
  }

  if (data.CO2 != undefined) {
    weatherModule.co2 = data.CO2;
  }

  if (data.Pressure != undefined) {
    weatherModule.pressure = data.Pressure;
  }

  return weatherModule;
}
