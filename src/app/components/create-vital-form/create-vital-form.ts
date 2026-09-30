import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import type { Observation } from 'fhir/r4';

import { ObservationService } from '../../services/observation-service';

@Component({
  selector: 'app-create-vital-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './create-vital-form.html',
  styleUrl: './create-vital-form.css',
})
export class CreateVitalForm {

  private observationService = inject(ObservationService);

  readonly baseUrl = input.required<string>();
  readonly accessToken = input.required<string>();
  readonly patientId = input.required<string>();

  readonly vitalCreated = output<void>();
  readonly cancel = output<void>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly vitalForm = new FormGroup({
    type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    value: new FormControl<number | null>(null),

    systolic: new FormControl<number | null>(null),

    diastolic: new FormControl<number | null>(null)
  });

  submit(): void {
    const {
      type,
      value,
      systolic,
      diastolic
    } = this.vitalForm.getRawValue();

    if (!type) {
      this.errorMessage.set('Please select a vital type.');
      return;
    }

    // Blood pressure requires two values
    if (type === 'blood-pressure') {
      if (systolic === null || diastolic === null) {
        this.errorMessage.set(
          'Systolic and diastolic values are required.'
        );

        return;
      }
    } else {
      // Other vital signs require one value
      if (value === null) {
        this.errorMessage.set(
          'A value is required.'
        );

        return;
      }
    }

    const observation = this.buildObservation(
      type,
      value,
      systolic,
      diastolic
    );

    console.log('Observation being created:', observation);

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.observationService
      .createObservation(
        this.baseUrl(),
        this.accessToken(),
        observation
      )
      .subscribe({
        next: createdObservation => {
          console.log(
            'Created observation:',
            createdObservation
          );

          this.submitting.set(false);

          this.vitalCreated.emit();
        },

        error: error => {
          console.error(
            'Failed to create vital:',
            error
          );

          console.error(
            'OperationOutcome:',
            JSON.stringify(error.error, null, 2)
          );

          this.errorMessage.set(
            'Failed to create vital.'
          );

          this.submitting.set(false);
        }
      });
  }

  private buildObservation(
    type: string,
    value: number | null,
    systolic: number | null,
    diastolic: number | null
  ): Observation {

    /*
     * Blood pressure is special because it does not use
     * Observation.valueQuantity.
     *
     * It contains systolic and diastolic measurements
     * inside Observation.component[].
     */
    if (type === 'blood-pressure') {

      if (systolic === null || diastolic === null) {
        throw new Error(
          'Blood pressure requires systolic and diastolic values.'
        );
      }

      return {
        resourceType: 'Observation',

        status: 'final',

        category: [
          {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ],
            text: 'Vital Signs'
          }
        ],

        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display:
                'Blood pressure panel with all children optional'
            }
          ],
          text: 'Blood Pressure'
        },

        subject: {
          reference: `Patient/${this.patientId()}`
        },

        effectiveDateTime: new Date().toISOString(),

        component: [
          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8480-6',
                  display: 'Systolic blood pressure'
                }
              ],
              text: 'Systolic Blood Pressure'
            },

            valueQuantity: {
              value: systolic,
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          },

          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8462-4',
                  display: 'Diastolic blood pressure'
                }
              ],
              text: 'Diastolic Blood Pressure'
            },

            valueQuantity: {
              value: diastolic,
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          }
        ]
      };
    }

    /*
     * All of the remaining vital types use a normal
     * Observation.valueQuantity.
     */

    if (value === null) {
      throw new Error('Vital value is required.');
    }

    let code = '';
    let display = '';
    let unit = '';
    let unitCode = '';

    switch (type) {

      case 'heart-rate':
        code = '8867-4';
        display = 'Heart Rate';
        unit = 'bpm';
        unitCode = '/min';
        break;

      case 'respiratory-rate':
        code = '9279-1';
        display = 'Respiratory Rate';
        unit = 'br/min';
        unitCode = '/min';
        break;

      case 'temperature':
        code = '8331-1';
        display = 'Oral Temperature';
        unit = 'degC';
        unitCode = 'Cel';
        break;

      default:
        throw new Error(
          `Unsupported vital type: ${type}`
        );
    }

    return {
      resourceType: 'Observation',

      status: 'final',

      category: [
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ],
          text: 'Vital Signs'
        }
      ],

      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code,
            display
          }
        ],
        text: display
      },

      subject: {
        reference: `Patient/${this.patientId()}`
      },

      effectiveDateTime: new Date().toISOString(),

      valueQuantity: {
        value,
        unit,
        system: 'http://unitsofmeasure.org',
        code: unitCode
      }
    };
  }

  getSelectedUnit(): string {
    switch (this.vitalForm.controls.type.value) {
      case 'heart-rate':
        return 'bpm';

      case 'respiratory-rate':
        return 'br/min';

      case 'temperature':
        return '°C';

      case 'blood-pressure':
        return 'mmHg';

      default:
        return '';
    }
  }
}