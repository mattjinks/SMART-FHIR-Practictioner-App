import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractictionerLaunch } from './practictioner-launch';

describe('PractictionerLaunch', () => {
  let component: PractictionerLaunch;
  let fixture: ComponentFixture<PractictionerLaunch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PractictionerLaunch],
    }).compileComponents();

    fixture = TestBed.createComponent(PractictionerLaunch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
