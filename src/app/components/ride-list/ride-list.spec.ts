import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideList } from './ride-list';

describe('RideList', () => {
  let component: RideList;
  let fixture: ComponentFixture<RideList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
