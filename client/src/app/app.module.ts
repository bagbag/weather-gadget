import { PortalModule } from '@angular/cdk/portal';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatTreeModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataSelectorComponent } from './components/data-selector/data-selector.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ModuleFieldsPipe } from './pipes/module-fields.pipe';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    DataSelectorComponent,
    ModuleFieldsPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    HttpClientModule,
    PortalModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTreeModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SettingsComponent, DataSelectorComponent]
})
export class AppModule { }
