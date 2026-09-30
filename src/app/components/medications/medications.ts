import { Component, inject, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import type { MedicationRequest } from 'fhir/r4';

import { MedicationService } from '../../services/medication-service';
import { SmartSessionService } from '../../services/smart-session-service';
import { MedicationDetails } from './medication-details/medication-details';

@Component({
  selector: 'app-medications',
  imports: [
    MatTableModule,
    MatSortModule,
    DatePipe,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './medications.html',
  styleUrl: './medications.css',
})
export class Medications {
  private medicationService = inject(MedicationService);
  private smartSessionService = inject(SmartSessionService);
  private dialog = inject(MatDialog);

  readonly medications = signal<MedicationRequest[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly displayedColumns: string[] = [
    'medication',
    'instructions',
    'authoredOn'
  ];

  readonly dataSource =
    new MatTableDataSource<MedicationRequest>();

  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor() {
    this.dataSource.sortingDataAccessor = (
      medication: MedicationRequest,
      property: string
    ): string | number => {

      switch (property) {
        case 'medication':
          return this
            .getMedicationName(medication)
            .toLowerCase();
        
        case 'authoredOn':
          return medication.authoredOn
            ? new Date(medication.authoredOn).getTime()
            : 0;

        default:
          return '';
      }
    };
  }

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    const baseUrl =
      this.smartSessionService.getBaseUrl();

    const accessToken =
      this.smartSessionService.getAccessToken();

    const patientId =
      this.smartSessionService.getPatientId();

    if (!baseUrl || !accessToken || !patientId) {
      this.errorMessage.set(
        'Missing base URL, access token, or patient ID.'
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.medicationService
      .getMedicationRequestsByPatient(
        baseUrl,
        accessToken,
        patientId
      )
      .subscribe({
        next: medications => {
          this.medications.set(medications);
          this.dataSource.data = medications;

          this.loading.set(false);
        },

        error: error => {
          console.error(
            'Failed to load medication requests:',
            error
          );

          this.errorMessage.set(
            'Failed to load medications.'
          );

          this.loading.set(false);
        }
      });
  }

  getMedicationName(
    medication: MedicationRequest
  ): string {
    return medication.medicationCodeableConcept
      ?.coding?.[0]?.display ?? 'Unknown medication';
  }

  getMedicationInstructions(
    medication: MedicationRequest
  ): string {
    return medication.dosageInstruction
      ?.[0]?.patientInstruction ?? 'No instructions';
  }

  openMedicationDetails(medication: MedicationRequest): void {
    this.dialog.open(MedicationDetails, {
      width: '500px',
      data: medication
    });
  }
}