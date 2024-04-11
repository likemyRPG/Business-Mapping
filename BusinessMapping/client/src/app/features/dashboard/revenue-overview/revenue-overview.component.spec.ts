import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RevenueOverviewComponent} from './revenue-overview.component';

describe('RevenueOverviewComponent', () => {
  let component: RevenueOverviewComponent;
  let fixture: ComponentFixture<RevenueOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
