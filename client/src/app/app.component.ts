
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { from, interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { Config, ConfigToken } from './config';
import { WeatherData } from './model';
import { WeatherService } from './services/weather.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly weatherService: WeatherService;
  private readonly settingsService: SettingsService;
  private readonly config: Config;

  private updateSubscription: Subscription;

  temperature: number;

  constructor(weatherService: WeatherService, settingsService: SettingsService, @Inject(ConfigToken) config: Config) {
    this.weatherService = weatherService;
    this.settingsService = settingsService;
    this.config = config;
  }

  async ngOnInit(): Promise<void> {
    await this.weatherService.login(this.config.username, this.config.password);

    this.updateSubscription = interval(10000).pipe(
      startWith(-1),
      switchMap(() => from(this.weatherService.getWeatherData()))
    ).subscribe((weatherData) => this.onUpdate(weatherData));
  }

  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe();
  }

  onUpdate(weatherData: WeatherData[]): void {
    this.temperature = weatherData[0].modules[0].temperature as number;
  }

  showSettings() {
    this.settingsService.showSettings();
  }
}
