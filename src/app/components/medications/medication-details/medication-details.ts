import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import type { MedicationRequest } from 'fhir/r4';

@Component({
  selector: 'app-medication-details',
  imports: [
    MatDialogModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './medication-details.html',
  styleUrl: './medication-details.css',
})
export class MedicationDetails {

  readonly medication =
    inject<MedicationRequest>(MAT_DIALOG_DATA);

  getMedicationName(): string {
    return this.medication.medicationCodeableConcept
      ?.coding?.[0]?.display
      ?? this.medication.medicationCodeableConcept?.text
      ?? 'Unknown medication';
  }

  getInstructions(): string {
    return this.medication.dosageInstruction
      ?.[0]?.patientInstruction
      ?? 'No instructions';
  }
}