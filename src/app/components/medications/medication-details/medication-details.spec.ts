import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationDetails } from './medication-details';

describe('MedicationDetails', () => {
  let component: MedicationDetails;
  let fixture: ComponentFixture<MedicationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
