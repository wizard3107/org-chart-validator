import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgUploadComponent } from './org-upload.component';

describe('OrgUploadComponent', () => {
  let component: OrgUploadComponent;
  let fixture: ComponentFixture<OrgUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
