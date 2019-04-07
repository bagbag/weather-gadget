import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WeatherStation } from '../model';
import { NetatmoWeatherStationData, NetatmoWeatherStationDataResponse, parseStationData } from '../netatmo';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  scope: string[];
};

const NETATMO_AUTH_URL = 'https://api.netatmo.com/oauth2/token';
const NETATMO_WEATHER_STATION_DATA_URL = 'https://api.netatmo.com/api/getstationsdata';

const loginRequestOptions = {
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
  private readonly loggedInChangedSubject: BehaviorSubject<boolean>;

  private accessToken: string | undefined;
  private refreshToken: string | undefined;
  private scope: string[] | undefined;

  get loggedIn(): boolean {
    return this.loggedInChangedSubject.value;
  }

  get loggedIn$(): Observable<boolean> {
    return this.loggedInChangedSubject.asObservable();
  }

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;

    this.loggedInChangedSubject = new BehaviorSubject(false);
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.scope = undefined;
  }

  async login(username: string, password: string, clientId: string, clientSecret: string): Promise<void> {
    const params = this.getLoginParams(username, password, clientId, clientSecret).toString();
    const response = await this.httpClient.post<AuthResponse>(NETATMO_AUTH_URL, params, loginRequestOptions).toPromise();

    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;
    this.scope = response.scope;

    this.loggedInChangedSubject.next(true);
  }

  logout(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.scope = undefined;

    this.loggedInChangedSubject.next(false);
  }

  async getWeatherStations(): Promise<WeatherStation[]> {
    const now = Math.floor(Date.now() / 1000);

    const stationData = await this.getWeatherStationsData();
    const weatherStations = parseStationData(stationData, now);

    return weatherStations;
  }

  private async getWeatherStationsData(): Promise<NetatmoWeatherStationData> {
    const params = this.getWeatherStationDataParams();
    const response = await this.httpClient.post<NetatmoWeatherStationDataResponse>(NETATMO_WEATHER_STATION_DATA_URL, params).toPromise();

    return response.body;
  }

  private getLoginParams(username: string, password: string, clientId: string, clientSecret: string): URLSearchParams {
    const params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', username);
    params.set('password', password);
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);

    return params;
  }

  private getWeatherStationDataParams(): { access_token: string } {
    if (this.accessToken == undefined) {
      throw new Error('not logged in');
    }

    const params = {
      access_token: this.accessToken
    };

    return params;
  }
}
