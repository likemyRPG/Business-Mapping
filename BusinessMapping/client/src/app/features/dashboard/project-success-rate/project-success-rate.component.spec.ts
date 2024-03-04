import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSuccessRateComponent } from './project-success-rate.component';

describe('ProjectSuccessRateComponent', () => {
  let component: ProjectSuccessRateComponent;
  let fixture: ComponentFixture<ProjectSuccessRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSuccessRateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectSuccessRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
