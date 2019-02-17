
import { Component, OnDestroy, OnInit } from '@angular/core';
import { from, interval, merge, Subscription, combineLatest } from 'rxjs';
import { filter, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { SettingsComponent } from './components/settings/settings.component';
import { WeatherData } from './model';
import { ChildWindowService } from './services/child-window.service';
import { SettingsService } from './services/settings.service';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly weatherService: WeatherService;
  private readonly childWindowService: ChildWindowService;
  private readonly settingsService: SettingsService;

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

    this.updateSubscription = combineLatest(this.weatherService.loggedIn$, ticker).pipe(
      filter(([loggedIn]) => loggedIn),
      switchMap(() => from(this.weatherService.getWeatherData()))
    ).subscribe((weatherData) => this.onUpdate(weatherData));
  }

  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe();
  }

  onUpdate(weatherData: WeatherData[]): void {
    this.temperature = weatherData[0].modules[0].temperature as number;
  }

  showSettings(): void {
    const windowHandle = this.childWindowService.showComponent(SettingsComponent);
  }
}
