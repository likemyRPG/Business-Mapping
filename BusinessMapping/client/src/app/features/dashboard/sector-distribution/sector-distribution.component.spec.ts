import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorDistributionComponent } from './sector-distribution.component';

describe('SectorDistributionComponent', () => {
  let component: SectorDistributionComponent;
  let fixture: ComponentFixture<SectorDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorDistributionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectorDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
