import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVitalForm } from './create-vital-form';

describe('CreateVitalForm', () => {
  let component: CreateVitalForm;
  let fixture: ComponentFixture<CreateVitalForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVitalForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateVitalForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
