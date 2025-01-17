import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrgUploadComponent } from './org-upload/org-upload.component';

@Component({
  selector: 'app-root',
  imports: [
    OrgUploadComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'org-chart-validation';
}
