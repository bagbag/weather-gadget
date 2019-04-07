import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from 'src/app/services/settings.service';
import { moduleDataFields, WeatherStation } from '../../model';

@Component({
  selector: 'app-data-selector',
  templateUrl: './data-selector.component.html',
  styleUrls: ['./data-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataSelectorComponent {
  private readonly settingsService: SettingsService;
  private readonly changeDetectorRef: ChangeDetectorRef;

  weatherStation: WeatherStation[];
  dataFields: string[];

  constructor(settingsService: SettingsService, changeDetectorRef: ChangeDetectorRef) {
    this.settingsService = settingsService;
    this.changeDetectorRef = changeDetectorRef;

    this.weatherStation = [];
    this.dataFields = moduleDataFields;
  }

  setweatherStation(weatherStation: WeatherStation[]): void {
    this.weatherStation = weatherStation;
    this.changeDetectorRef.markForCheck();
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

  reset(): void {
    this.settingsService.save({ enabledModuleFields: [] });
  }
}
