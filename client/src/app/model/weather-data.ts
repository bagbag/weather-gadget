export type WeatherData = {
  timestamp: number;
  stationId: string;
  stationName?: string;
  modules: WeatherModule[];
};

export type WeatherModule = {
  moduleId: string;
  moduleName?: string;
  lastContact?: number;
  rain?: number;
  noise?: number;
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  pressure?: number;
  co2?: number;
};
