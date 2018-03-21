import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WeatherData } from '../model';
import { NetatmoWeatherStationData, NetatmoWeatherStationDataResponse, parseStationData } from '../netatmo';

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  scope: string[];
};

const NETATMO_AUTH_URL = 'https://api.netatmo.com/oauth2/token';
const NETATMO_WEATHER_STATION_DATA_URL = 'https://api.netatmo.com/api/getstationsdata';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly httpClient: HttpClient;
  private readonly clientId: string;
  private readonly clientSecret: string;

  private accessToken: string;
  private refreshToken: string;
  private scope: string[];

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async login(username: string, password: string): Promise<void> {
    const params = this.getLoginParams(username, password);
    const response = await this.httpClient.post<AuthResponse>(NETATMO_AUTH_URL, params).toPromise();

    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;
    this.scope = response.scope;
  }

  private async getWeatherData(): Promise<WeatherData[]> {
    const now = Math.floor(Date.now() / 1000);

    const stationData = await this.getWeatherStationData();
    const weatherDatas = parseStationData(stationData, now);

    return weatherDatas;
  }

  private async getWeatherStationData(): Promise<NetatmoWeatherStationData> {
    const params = this.getWeatherStationDataParams();
    const response = await this.httpClient.post<NetatmoWeatherStationDataResponse>(NETATMO_WEATHER_STATION_DATA_URL, params).toPromise();

    console.log(JSON.stringify(response.body, undefined, 2));

    return response.body;
  }

  private getLoginParams(username: string, password: string) {
    const params = {
      grant_type: 'password',
      username,
      password,
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    return params;
  }

  private getWeatherStationDataParams() {
    const params = {
      access_token: this.accessToken
    };

    return params;
  }
}
