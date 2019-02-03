import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { ApplicationRef, Component, ComponentFactoryResolver, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { from, interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { SettingsComponent } from './components/settings/settings.component';
import { Config, ConfigToken } from './config';
import { WeatherData } from './model';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly weatherService: WeatherService;
  private readonly config: Config;

  private updateSubscription: Subscription;
  private settingsComponentPortal: ComponentPortal<SettingsComponent>;
  private settingsHost: DomPortalOutlet;

  temperature: number;

  constructor(weatherService: WeatherService, @Inject(ConfigToken) config: Config,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector) {
    this.weatherService = weatherService;
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
    const settingsWindow = window.open('') as Window;

    setTimeout(() => {
      const settingsBody = settingsWindow.document.getElementsByTagName('body')[0];

      (window as any).settingsBody = settingsBody;
      (window as any).settingsWindow = settingsWindow;

      this.settingsComponentPortal = new ComponentPortal(SettingsComponent);
      this.settingsHost = new DomPortalOutlet(settingsBody, this.componentFactoryResolver, this.appRef, this.injector);
      this.settingsHost.attach(this.settingsComponentPortal);
    }, 1000);

    //    this.settingsHost.detach();
  }
}
