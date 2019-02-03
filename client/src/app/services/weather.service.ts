import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Config, ConfigToken } from '../config';
import { WeatherData } from '../model';
import { NetatmoWeatherStationData, NetatmoWeatherStationDataResponse, parseStationData } from '../netatmo';

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  scope: string[];
};

const NETATMO_AUTH_URL = 'https://api.netatmo.com/oauth2/token';
const NETATMO_WEATHER_STATION_DATA_URL = 'https://api.netatmo.com/api/getstationsdata';

const LoginRequestOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'my-auth-token'
  })
};

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

  constructor(httpClient: HttpClient, @Inject(ConfigToken) config: Config) {
    this.httpClient = httpClient;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  async login(username: string, password: string): Promise<void> {
    const params = this.getLoginParams(username, password).toString();
    const response = await this.httpClient.post<AuthResponse>(NETATMO_AUTH_URL, params, LoginRequestOptions).toPromise();

    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;
    this.scope = response.scope;
  }

  async getWeatherData(): Promise<WeatherData[]> {
    const now = Math.floor(Date.now() / 1000);

    const stationData = await this.getWeatherStationData();
    const weatherDatas = parseStationData(stationData, now);

    return weatherDatas;
  }

  private async getWeatherStationData(): Promise<NetatmoWeatherStationData> {
    const params = this.getWeatherStationDataParams();
    const response = await this.httpClient.post<NetatmoWeatherStationDataResponse>(NETATMO_WEATHER_STATION_DATA_URL, params).toPromise();

    return response.body;
  }

  private getLoginParams(username: string, password: string): URLSearchParams {
    const params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', username);
    params.set('password', password);
    params.set('client_id', this.clientId);
    params.set('client_secret', this.clientSecret);

    return params;
  }

  private getWeatherStationDataParams() {
    const params = {
      access_token: this.accessToken
    };

    return params;
  }
}
