import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Bundle, MedicationRequest } from 'fhir/r4';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  private http = inject(HttpClient);

  getMedicationRequestsByPatient(
    baseUrl: string,
    accessToken: string,
    patientId: string
  ): Observable<MedicationRequest[]> {

    const url = `${baseUrl}/MedicationRequest`;

    return this.http
      .get<Bundle<MedicationRequest>>(url, {
        params: {
          patient: patientId
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .pipe(
        map(bundle =>
          bundle.entry
            ?.map(entry => entry.resource)
            .filter(
              (resource): resource is MedicationRequest =>
                resource?.resourceType === 'MedicationRequest'
            ) ?? []
        )
      );
  }
}