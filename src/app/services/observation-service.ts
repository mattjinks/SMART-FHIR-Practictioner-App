import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Bundle, Observation } from 'fhir/r4';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObservationService {

  private http = inject(HttpClient);

  getObservationsByPatient(
    baseUrl: string,
    accessToken: string,
    patientId: string
  ): Observable<Observation[]> {

    const url = `${baseUrl}/Observation`;

    return this.http
      .get<Bundle<Observation>>(url, {
        params: {
          patient: patientId,
          sort: '-date',
          category: 'vital-signs'
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
              (resource): resource is Observation =>
                resource?.resourceType === 'Observation'
            ) ?? []
        )
      );
  }

  createObservation(
    baseUrl: string,
    accessToken: string,
    observation: Observation
  ): Observable<Observation> {
    const url = `${baseUrl}/Observation`;

    return this.http.post<Observation>(
      url,
      observation,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/fhir+json'
        }
      }
    );
  }
}