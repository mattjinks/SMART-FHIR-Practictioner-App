import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBanner } from './patient-banner';

describe('PatientBanner', () => {
  let component: PatientBanner;
  let fixture: ComponentFixture<PatientBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
