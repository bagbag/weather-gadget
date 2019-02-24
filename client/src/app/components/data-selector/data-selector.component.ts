import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';
import { moduleDataFields, WeatherData } from '../../model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-data-selector',
  templateUrl: './data-selector.component.html',
  styleUrls: ['./data-selector.component.scss']
})
export class DataSelectorComponent implements OnInit {
  private readonly settingsService: SettingsService;

  weatherData: WeatherData[];
  dataFields: string[];

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;

    this.weatherData = [];
    this.dataFields = moduleDataFields;
  }

  ngOnInit() {
  }

  isModuleFieldEnabled(stationId: string, moduleId: string, field: string): Observable<boolean> {
    return this.settingsService.settings$.pipe(
      map((settings) => settings.enabledModuleFields),
      map((enabledModuleFields) => {
        const enabled = enabledModuleFields.some((moduleField) =>
          (moduleField.stationId == stationId) &&
          (moduleField.moduleId == moduleId) &&
          (moduleField.field == field));

        return enabled;
      }));
  }

  setModuleFieldEnabled(stationId: string, moduleId: string, field: string, enabled: boolean): void {
    const currentEnabledModuleFields = this.settingsService.getEnabledModuleFields();

    const newEnabledModuleFields = enabled
      ? [...currentEnabledModuleFields, { stationId, moduleId, field }]
      : currentEnabledModuleFields.filter((moduleField) =>
        (moduleField.stationId != stationId) ||
        (moduleField.moduleId != moduleId) ||
        (moduleField.field != field));

    this.settingsService.save({ enabledModuleFields: newEnabledModuleFields });
  }
}
