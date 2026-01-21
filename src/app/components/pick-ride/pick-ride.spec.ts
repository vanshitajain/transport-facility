import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickRide } from './pick-ride';

describe('PickRide', () => {
  let component: PickRide;
  let fixture: ComponentFixture<PickRide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickRide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickRide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
