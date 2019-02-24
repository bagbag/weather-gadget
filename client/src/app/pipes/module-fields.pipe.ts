import { Pipe, PipeTransform } from '@angular/core';
import { moduleDataFields, WeatherModule } from '../model';

type ModuleField = {
  name: string,
  value: number
};

@Pipe({
  name: 'moduleFields'
})
export class ModuleFieldsPipe implements PipeTransform {
  transform(weatherModule: WeatherModule, _args?: any): ModuleField[] {
    const moduleFields = moduleDataFields
      .filter((field) => weatherModule.hasOwnProperty(field))
      .map((field) => ({ name: field, value: (weatherModule as any as { [key: string]: number })[field] }));

    return moduleFields;
  }
}
