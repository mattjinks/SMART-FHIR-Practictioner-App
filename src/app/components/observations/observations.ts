import { Component, inject, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Observation } from 'fhir/r4';

import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { ObservationService } from '../../services/observation-service';
import { CreateVitalForm } from '../create-vital-form/create-vital-form';
import { SmartSessionService } from '../../services/smart-session-service';

@Component({
  selector: 'app-observations',
  imports: [
    DatePipe,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    CreateVitalForm
  ],
  templateUrl: './observations.html',
  styleUrl: './observations.css',
})
export class Observations {

  private observationService = inject(ObservationService);
  private smartSessionService = inject(SmartSessionService);

  readonly baseUrl = this.smartSessionService.getBaseUrl();
  readonly accessToken = this.smartSessionService.getAccessToken();
  readonly patientId = this.smartSessionService.getPatientId();

  readonly observations = signal<Observation[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showCreateVitalForm = signal(false);

  readonly displayedColumns: string[] = [
    'observation',
    'value',
    'date'
  ];

  readonly dataSource =
    new MatTableDataSource<Observation>();

  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor() {
    this.dataSource.sortingDataAccessor = (
      observation: Observation,
      property: string
    ): string | number => {

      switch (property) {

        case 'observation':
          return this
            .getObservationName(observation)
            .toLowerCase();

        case 'date':
          return this.getObservationDateTimestamp(
            observation
          );

        default:
          return '';
      }
    };
  }

  ngOnInit(): void {
    this.loadObservations();
  }

  loadObservations(): void {
    const baseUrl = this.baseUrl;
    const accessToken = this.accessToken;
    const patientId = this.patientId;

    if (!baseUrl || !accessToken || !patientId) {
      this.errorMessage.set(
        'Missing base URL, access token, or patient ID.'
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.observationService
      .getObservationsByPatient(
        baseUrl,
        accessToken,
        patientId
      )
      .subscribe({
        next: observations => {
          this.observations.set(observations);
          this.dataSource.data = observations;

          this.loading.set(false);
        },

        error: error => {
          console.error(
            'Failed to fetch observations:',
            error
          );

          this.errorMessage.set(
            'Failed to load observations.'
          );

          this.loading.set(false);
        }
      });
  }

  getObservationName(
    observation: Observation
  ): string {
    return observation.code?.text
      ?? observation.code?.coding?.[0]?.display
      ?? 'Unknown observation';
  }

  getObservationValue(
    observation: Observation
  ): string {

    if (this.isBloodPressure(observation)) {
      const systolic = this.getSystolic(observation);
      const diastolic = this.getDiastolic(observation);

      return `${systolic ?? '—'}/${diastolic ?? '—'} mmHg`;
    }

    const value =
      observation.valueQuantity?.value;

    const unit =
      observation.valueQuantity?.unit ?? '';

    if (value === undefined) {
      return '—';
    }

    return `${value} ${unit}`.trim();
  }

  getObservationDate(
    observation: Observation
  ): string | undefined {
    return observation.effectivePeriod?.start
      ?? observation.effectiveDateTime;
  }

  private getObservationDateTimestamp(
    observation: Observation
  ): number {
    const date = this.getObservationDate(observation);

    return date
      ? new Date(date).getTime()
      : 0;
  }

  getSystolic(
    observation: Observation
  ): number | undefined {
    const systolic = observation.component?.find(
      component =>
        component.code?.coding?.some(
          coding => coding.code === '8480-6'
        )
    );

    return systolic?.valueQuantity?.value;
  }

  getDiastolic(
    observation: Observation
  ): number | undefined {
    const diastolic = observation.component?.find(
      component =>
        component.code?.coding?.some(
          coding => coding.code === '8462-4'
        )
    );

    return diastolic?.valueQuantity?.value;
  }

  isBloodPressure(
    observation: Observation
  ): boolean {
    return observation.code?.coding?.some(
      coding => coding.code === '85354-9'
    ) ?? false;
  }

  onVitalCreated(): void {
    this.showCreateVitalForm.set(false);
    this.loadObservations();
  }

  openVitalForm(): void {
    this.showCreateVitalForm.set(true);
  }

  closeVitalForm(): void {
    this.showCreateVitalForm.set(false);
  }
}