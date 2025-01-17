import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-error-table',
  imports: [CommonModule],
  templateUrl: './error-table.component.html',
  styleUrl: './error-table.component.scss'
})
export class ErrorTableComponent {
  @Input() errors: { category: string; errors: string[] }[] = [];
  @Output() goBack = new EventEmitter<void>();

  exportToExcel(): void {
    const data: any[] = [];

    this.errors.forEach((errorCategory) => {
      errorCategory.errors.forEach((error) => {
        data.push({
          Category: errorCategory.category,
          Error: error,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');
    XLSX.writeFile(workbook, 'ValidationErrors.xlsx');
  }

  onBack(): void {
    this.goBack.emit();
  }
}
