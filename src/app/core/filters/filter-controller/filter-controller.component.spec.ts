import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterControllerComponent } from './filter-controller.component';

describe('FilterControllerComponent', () => {
  let component: FilterControllerComponent;
  let fixture: ComponentFixture<FilterControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
