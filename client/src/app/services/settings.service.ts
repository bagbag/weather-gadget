import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

export type ModuleField = {
  stationId: string,
  moduleId: string,
  field: string
};

export type Settings = {
  username: string | undefined,
  password: string | undefined,
  clientId: string | undefined,
  clientSecret: string | undefined,
  enabledModuleFields: ModuleField[]
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly settingsChangedSubject: Subject<Settings>;

  get settings$(): Observable<Settings> {
    return this.settingsChangedSubject.asObservable();
  }

  constructor() {
    this.settingsChangedSubject = new ReplaySubject(1);

    const settings = this.getSettingsObject();
    this.settingsChangedSubject.next(settings);
  }

  getClientId(): string | undefined {
    return this.getSetting<string>('clientKey');
  }

  getClientSecret(): string | undefined {
    return this.getSetting<string>('clientSecret');
  }

  getUsername(): string | undefined {
    return this.getSetting<string>('username');
  }

  getPassword(): string | undefined {
    return this.getSetting<string>('password');
  }

  getEnabledModuleFields(): ModuleField[] {
    return this.getSetting<ModuleField[]>('enabledModuleFields', []);
  }

  save(settings: { clientId?: string, clientSecret?: string, username?: string, password?: string, enabledModuleFields?: ModuleField[] }): void {
    const { clientId, clientSecret, username, password, enabledModuleFields } = settings;

    if (clientId != undefined) {
      this.setSetting('clientId', clientId);
    }

    if (clientSecret != undefined) {
      this.setSetting('clientSecret', clientSecret);
    }

    if (username != undefined) {
      this.setSetting('username', username);
    }

    if (password != undefined) {
      this.setSetting('password', password);
    }

    if (enabledModuleFields != undefined) {
      this.setSetting('enabledModuleFields', enabledModuleFields);
    }

    this.emitSettings();
  }

  private emitSettings(): void {
    const settings = this.getSettingsObject();
    this.settingsChangedSubject.next(settings);
  }

  private getSettingsObject(): Settings {
    const username = this.getUsername();
    const password = this.getPassword();
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const enabledModuleFields = this.getEnabledModuleFields();

    const settings: Settings = { username, password, clientId, clientSecret, enabledModuleFields };
    return settings;
  }

  private getSetting<T>(key: string): T | undefined;
  private getSetting<T>(key: string, defaultValue: T): T;
  private getSetting<T, U>(key: string, defaultValue: U): T | U;
  private getSetting<T, U>(key: string, defaultValue?: U): T | U {
    const serialized = localStorage.getItem(`settings:${key}`);

    if (serialized == undefined) {
      return defaultValue as U;
    }

    try {
      const deserialized = JSON.parse(serialized) as T;
      return deserialized;
    }
    catch (error) {
      localStorage.removeItem(`settings:${key}`);
      return defaultValue as U;
    }
  }

  private setSetting<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    localStorage.setItem(`settings:${key}`, serialized);
  }
}
