import { InjectionToken } from '@angular/core';

export type Config = {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
};

export const ConfigToken = new InjectionToken<Config>('config');

export const config = {
  clientId: '',
  clientSecret: '',
  username: '',
  password: ''
};
