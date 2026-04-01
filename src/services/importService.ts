import { apiClient } from './api';
import { ImportResult } from '../types';

const ENDPOINT = '/import';

export const importService = {
  // Import materials from Excel
  async importMaterials(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportResult>(`${ENDPOINT}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Import project from Excel
  async importProject(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportResult>(`${ENDPOINT}/project`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download materials template
  async downloadMaterialsTemplate(): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/materials/template`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download project template
  async downloadProjectTemplate(): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/project/template`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Generic validate - client-side validation before import
  async validate(file: File, importType: 'materials' | 'project'): Promise<{
    isValid: boolean;
    rowCount: number;
    errors: string[];
    warnings: string[];
    previewData: Array<Record<string, unknown>>;
  }> {
    // Validate file type
    const errors: string[] = [];
    const warnings: string[] = [];
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      errors.push('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
      return { isValid: false, rowCount: 0, errors, warnings, previewData: [] };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
      return { isValid: false, rowCount: 0, errors, warnings, previewData: [] };
    }

    // Try to parse the Excel file for preview
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
      
      if (jsonData.length === 0) {
        errors.push('The file appears to be empty');
        return { isValid: false, rowCount: 0, errors, warnings, previewData: [] };
      }

      // Validate required columns for materials
      if (importType === 'materials') {
        const requiredColumns = ['ItemCode', 'Description', 'BasePrice', 'DefaultDiscount', 'Category'];
        const actualColumns = Object.keys(jsonData[0]);
        const missingColumns = requiredColumns.filter(
          col => !actualColumns.some(ac => ac.toLowerCase() === col.toLowerCase())
        );
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }
      }

      if (jsonData.length > 1000) {
        warnings.push(`Large file with ${jsonData.length} rows. Import may take a while.`);
      }

      return {
        isValid: errors.length === 0,
        rowCount: jsonData.length,
        errors,
        warnings,
        previewData: jsonData.slice(0, 5),
      };
    } catch {
      errors.push('Unable to parse the Excel file. Please ensure it is a valid .xlsx or .xls file');
      return { isValid: false, rowCount: 0, errors, warnings, previewData: [] };
    }
  },

  // Generic download template
  async downloadTemplate(importType: 'materials' | 'project'): Promise<void> {
    const blob = importType === 'materials'
      ? await this.downloadMaterialsTemplate()
      : await this.downloadProjectTemplate();
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = importType === 'materials' ? 'materials-template.xlsx' : 'project-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default importService;
