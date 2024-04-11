import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SectorRatioComponent} from './sector-ratio.component';

describe('SectorRatioComponent', () => {
  let component: SectorRatioComponent;
  let fixture: ComponentFixture<SectorRatioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorRatioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorRatioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
