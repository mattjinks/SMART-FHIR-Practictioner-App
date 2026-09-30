import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PractictionerLaunch } from './components/practictioner-launch/practictioner-launch';
import { SmartSessionService } from './services/smart-session-service';
import { PatientBanner } from './components/patient-banner/patient-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PractictionerLaunch, PatientBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cerner-practitioner-app');
  readonly smartSessionService = inject(SmartSessionService);
  readonly hasSession = signal<boolean>(this.smartSessionService.hasSession());
  readonly needPatientBanner = signal<boolean | undefined>(this.smartSessionService.needPatientBanner());
}
