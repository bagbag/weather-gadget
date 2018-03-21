export type WindHistoryItem = {
  time_utc: number;
  WindStrength: number;
  WindAngle: number;
};

export type DashboardData = {
  time_utc: number;
  Temperature?: number;
  Rain?: number;
  Humidity?: number;
  Noise?: number,
  date_max_temp?: number;
  date_min_temp?: number;
  min_temp?: number;
  max_temp?: number;
  sum_rain_1?: number;
  sum_rain_24?: number;
  WindAngle?: number;
  WindStrength?: number;
  WindHistoric?: WindHistoryItem[];
  date_max_wind_str?: number;
  max_wind_angle?: number;
  max_wind_str?: number;
  GustAngle?: number;
  GustStrength?: number;
  CO2?: number;
  Pressure?: number;
};

export type Module = {
  _id: string;
  last_message: number;
  last_seen: number;
  dashboard_data: DashboardData;
  data_type: string[];
  module_name: string;
};

export type Device = {
  _id: string;
  last_status_store: number;
  station_name: string;
  modules: Module[];
  module_name: string;
  data_type: string[];
  dashboard_data: DashboardData;
};

export type NetatmoWeatherStationData = {
  devices: Device[];
};

export type NetatmoWeatherStationDataResponse = {
  body: NetatmoWeatherStationData;
};
