import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPostsForLastMonthComponent } from './best-posts-for-last-month.component';

describe('BestPostsForLastMonthComponent', () => {
  let component: BestPostsForLastMonthComponent;
  let fixture: ComponentFixture<BestPostsForLastMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestPostsForLastMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestPostsForLastMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
