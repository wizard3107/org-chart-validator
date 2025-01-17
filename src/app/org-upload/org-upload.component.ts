import { Component, ViewEncapsulation } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { ErrorTableComponent } from '../error-table/error-table.component';
import { ErrorType, UserData, validateFile } from '../utils/validation.utils';

@Component({
  selector: 'app-org-upload',
  imports: [MatTableModule, CommonModule, ErrorTableComponent],
  templateUrl: './org-upload.component.html',
  styleUrl: './org-upload.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrgUploadComponent {
  data: UserData[] = [];
  errors: ErrorType[] = [];
  dataLoaded = false;
  invalidFile: boolean = false;
  private userMap: Map<string, UserData> = new Map();
  showErrorTable = false;
  emptyFile: boolean = false;
  invalidData: boolean = false;

  onFileChange(event: any): void {
    this.invalidFile = false; // Flag for Invalid File
    this.emptyFile = false; // Flag for empty files
    this.invalidData = false; // Flag for invalid data
    this.dataLoaded = false;

    const requiredHeaders = ['email', 'fullname', 'role', 'reportsto'];
    const file = event.target.files[0];

    if (!file) {
      this.invalidFile = true;
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook || workbook.SheetNames.length === 0) {
          this.emptyFile = true;
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        }) as string[][];

        if (sheetData.length === 0) {
          this.emptyFile = true; // Sheet exists but has no data
          return;
        }

        // Extract and validate headers from the first row
        const headers = (sheetData[0] as string[]).map((header) =>
          header.toLowerCase().trim()
        );

        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          this.invalidData = true; // Missing required headers
          return;
        }

        this.data = XLSX.utils.sheet_to_json(sheet);
        this.dataLoaded = true; // Valid file and data
      } catch (error) {
        this.invalidFile = true; // Invalid file format or corrupt file
      }
    };

    reader.onerror = () => {
      this.invalidFile = true; // Error reading the file
    };

    reader.readAsArrayBuffer(file);
  }

  validateFile(): void {
    // Reset all state
    this.errors = [];
    this.userMap.clear();

    // Used for File Validation
    this.errors = validateFile(this.data);

    this.showErrorTable = true;
    this.dataLoaded = false;
  }
  goBack(): void {
    this.showErrorTable = false;
    this.invalidFile = false;
  }
}
