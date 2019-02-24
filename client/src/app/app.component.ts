
import { Component, OnDestroy, OnInit } from '@angular/core';
import { from, interval, merge, Subscription, combineLatest, Observable } from 'rxjs';
import { filter, startWith, switchMap, withLatestFrom, shareReplay, take } from 'rxjs/operators';
import { SettingsComponent } from './components/settings/settings.component';
import { WeatherData } from './model';
import { ChildWindowService } from './services/child-window.service';
import { SettingsService } from './services/settings.service';
import { WeatherService } from './services/weather.service';
import { DataSelectorComponent } from './components/data-selector/data-selector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly weatherService: WeatherService;
  private readonly childWindowService: ChildWindowService;
  private readonly settingsService: SettingsService;

  private weatherDataObservable: Observable<WeatherData[]>;
  private updateSubscription: Subscription;

  temperature: number;

  constructor(weatherService: WeatherService, childWindowService: ChildWindowService, settingsService: SettingsService) {
    this.weatherService = weatherService;
    this.childWindowService = childWindowService;
    this.settingsService = settingsService;
  }

  async ngOnInit(): Promise<void> {
    this.settingsService.settings$.subscribe(async ({ username, password, clientId, clientSecret }) => {
      this.weatherService.logout();

      if ((username == undefined) || (password == undefined) || (clientId == undefined) || (clientSecret == undefined)) {
        return;
      }

      await this.weatherService.login(username, password, clientId, clientSecret);
    });

    const ticker = interval(10000).pipe(startWith(-1));

    this.weatherDataObservable = combineLatest(this.weatherService.loggedIn$, ticker).pipe(
      filter(([loggedIn]) => loggedIn),
      switchMap(() => from(this.weatherService.getWeatherData())),
      shareReplay(1)
    );

    this.updateSubscription = this.weatherDataObservable.subscribe((weatherData) => this.onUpdate(weatherData));
  }

  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe();
  }

  onUpdate(weatherData: WeatherData[]): void {
    this.temperature = weatherData[0].modules[0].temperature as number;
  }

  async showSettings(): Promise<void> {
    const windowHandle = await this.childWindowService.showComponent(SettingsComponent);
  }

  async showDataSelector(): Promise<void> {
    const weatherDataPromise = this.weatherDataObservable.pipe(take(1)).toPromise();
    const windowHandle = await this.childWindowService.showComponent(DataSelectorComponent);

    windowHandle.component.weatherData = await weatherDataPromise;
  }
}
