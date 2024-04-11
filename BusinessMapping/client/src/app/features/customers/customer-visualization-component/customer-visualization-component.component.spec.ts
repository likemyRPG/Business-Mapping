import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CustomerVisualizationComponent} from './customer-visualization-component.component';

describe('CustomerVisualizationComponent', () => {
  let component: CustomerVisualizationComponent;
  let fixture: ComponentFixture<CustomerVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerVisualizationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
