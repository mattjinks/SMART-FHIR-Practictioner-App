import { HttpClient } from '@angular/common/http';
import { Component, inject, input, signal, ɵɵsetComponentScope } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Patient } from 'fhir/r4';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-banner',
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './patient-banner.html',
  styleUrl: './patient-banner.css',
})
export class PatientBanner {

  private http = inject(HttpClient);

  readonly LOCAL_STORAGE_PATIENT = 'patient'; 

  readonly accessToken = input<string | null>();
  readonly baseUrl = input<string | null>();
  readonly patientId = input<string | null>();

  // readonly patientResource = signal<Patient | null>(this.loadPatient());
  readonly patientResource = signal<Patient | null>(null);


  ngOnInit() {
    console.log('PatientBanner initialized with accessToken:', this.accessToken());
    console.log('PatientBanner initialized with baseUrl:', this.baseUrl());

    const patientId = this.patientId();
    
    // if (this.patientResource()) {
    //   console.log("patient resource: ", this.patientResource())
    //   return;
    // }

    if (patientId) {
      this.getPatientById(patientId).subscribe({
        next: patient => {
          this.patientResource.set(patient);
          localStorage.setItem(this.LOCAL_STORAGE_PATIENT, JSON.stringify(patient));
          console.log("Fetched Patient:", patient);
        },
        error: error => {
          console.error('Failed to load patient:', error);
        }
      });
    }
  }

  getPatientById(id: string): Observable<Patient> {
    const url = `${this.baseUrl()}/Patient/${id}`;
    return this.http.get<Patient>(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`
      }
    });
  }

  loadPatient(): Patient | null {
    const storedPatient = localStorage.getItem(
      this.LOCAL_STORAGE_PATIENT
    );

    return storedPatient
      ? JSON.parse(storedPatient) as Patient
      : null;
  }
}
