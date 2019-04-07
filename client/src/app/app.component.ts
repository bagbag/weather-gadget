
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, from, interval, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { DataSelectorComponent } from './components/data-selector/data-selector.component';
import { SettingsComponent } from './components/settings/settings.component';
import { WeatherModule, WeatherStation, moduleDataFields } from './model';
import { ChildWindowService } from './services/child-window.service';
import { SettingsService, ModuleField } from './services/settings.service';
import { WeatherService } from './services/weather.service';

type WeatherDataViewModel = {
  stations: WeatherStationViewModule[]
};

type WeatherStationViewModule = {
  name?: string,
  modules: WeatherModuleViewModel[]
};

type WeatherModuleViewModel = {
  name?: string,
  fields: WeatherFieldViewModel[]
};

type WeatherFieldViewModel = {
  name: string,
  value: string | number
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly weatherService: WeatherService;
  private readonly childWindowService: ChildWindowService;
  private readonly settingsService: SettingsService;

  private weatherStations$: Observable<WeatherStation[]>;
  data$: Observable<WeatherDataViewModel>;

  constructor(weatherService: WeatherService, childWindowService: ChildWindowService, settingsService: SettingsService) {
    this.weatherService = weatherService;
    this.childWindowService = childWindowService;
    this.settingsService = settingsService;
  }

  async ngOnInit(): Promise<void> {
    this.settingsService.settings$.pipe(
      map(({ username, password, clientId, clientSecret }) => ({ username, password, clientId, clientSecret })),
      distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b))
    )
      .subscribe(async ({ username, password, clientId, clientSecret }) => {
        this.weatherService.logout();

        if ((username == undefined) || (password == undefined) || (clientId == undefined) || (clientSecret == undefined)) {
          return;
        }

        await this.weatherService.login(username, password, clientId, clientSecret);
      });

    const ticker = interval(10000).pipe(startWith(-1));

    this.weatherStations$ = combineLatest(this.weatherService.loggedIn$, ticker).pipe(
      filter(([loggedIn]) => loggedIn),
      switchMap(() => from(this.weatherService.getWeatherStations())),
      shareReplay(1)
    );

    const enabledModuleFields$ = this.settingsService.settings$.pipe(
      map(({ enabledModuleFields }) => enabledModuleFields)
    );

    this.data$ = combineLatest(this.weatherStations$, enabledModuleFields$).pipe(
      map(([stations, enabledModuleFields]) => {
        const enabledStations = new Set(enabledModuleFields.map(({ stationId }) => stationId));
        const enabledModules = new Set(enabledModuleFields.map(({ moduleId }) => moduleId));

        const data: WeatherDataViewModel = {
          stations: []
        };

        for (const station of stations) {
          if (!enabledStations.has(station.stationId)) {
            continue;
          }

          const stationViewModel: WeatherStationViewModule = {
            name: station.stationName,
            modules: []
          };

          for (const module of station.modules) {
            if (!enabledModules.has(module.moduleId)) {
              continue;
            }

            const fields = moduleDataFields.filter((field) => this.isEnabled(enabledModuleFields, station, module, field));

            const moduleViewModel: WeatherModuleViewModel = {
              name: module.moduleName,
              fields: []
            };

            for (const field of fields) {
              const value = (module as { [key: string]: string | number })[field];

              if (value == undefined) {
                continue;
              }

              moduleViewModel.fields.push({ name: field, value });
            }

            stationViewModel.modules.push(moduleViewModel);
          }

          data.stations.push(stationViewModel);
        }

        return data;
      })
    );
  }

  isEnabled(enabledModuleFields: ModuleField[], station: WeatherStation, module: WeatherModule, field: string): boolean {
    return enabledModuleFields.some(({ stationId, moduleId, field: enabledField }) =>
      station.stationId == stationId &&
      module.moduleId == moduleId &&
      field == enabledField
    );
  }

  ngOnDestroy(): void {
  }

  async showSettings(): Promise<void> {
    const windowHandle = await this.childWindowService.showComponent(SettingsComponent);
  }

  async showDataSelector(): Promise<void> {
    const weatherStationPromise = this.weatherStations$.pipe(take(1)).toPromise();
    const windowHandle = await this.childWindowService.showComponent(DataSelectorComponent);

    const weatherStation = await weatherStationPromise;
    windowHandle.component.setweatherStation(weatherStation);
  }
}
