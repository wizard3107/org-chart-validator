import { Component, ViewEncapsulation } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { ErrorTableComponent } from '../error-table/error-table.component';
import {  ErrorType, UserData, validateFile, ValidationErrorType } from '../utils/validation.utils';

@Component({
  selector: 'app-org-upload',
  imports: [MatTableModule, CommonModule,
    ErrorTableComponent
  ],
  templateUrl: './org-upload.component.html',
  styleUrl: './org-upload.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrgUploadComponent {
  data: UserData[] = [];
  errors:  ErrorType[] = [];
  dataLoaded = false;
  private userMap: Map<string, UserData> = new Map();
  showErrorTable = false;

  onFileChange(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      this.data = XLSX.utils.sheet_to_json(sheet);
      console.log(this.data,'data loaded');
      this.dataLoaded = true;
    };
    
    reader.readAsArrayBuffer(file);
  }

  validateFile(): void {
    // Reset all state
    this.errors = [];
    this.userMap.clear();

    this.errors = validateFile(this.data);

    this.showErrorTable = true;
    this.dataLoaded = false;
  }
  goBack(): void {
    this.showErrorTable = false;
  }
}