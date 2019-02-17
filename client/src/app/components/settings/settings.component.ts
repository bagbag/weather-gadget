import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private readonly settingsService: SettingsService;

  clientId: string;
  clientSecret: string;
  username: string;
  password: string;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  ngOnInit(): void {
    const clientId = this.settingsService.getClientId();
    const clientSecret = this.settingsService.getClientSecret();
    const username = this.settingsService.getUsername();
    const password = this.settingsService.getPassword();

    this.clientId = (clientId != undefined) ? clientId : '';
    this.clientSecret = (clientSecret != undefined) ? clientSecret : '';
    this.username = (username != undefined) ? username : '';
    this.password = (password != undefined) ? password : '';
  }

  save(): void {
    this.settingsService.save({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      username: this.username,
      password: this.password
    });
  }
}
