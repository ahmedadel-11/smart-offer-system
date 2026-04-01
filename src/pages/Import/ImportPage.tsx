import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import { useDropzone } from 'react-dropzone';
import { PageHeader, Button, Card } from '../../components';
import { importService } from '../../services/importService';
import toast from 'react-hot-toast';

type ImportType = 'materials' | 'project';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  previewData: Array<Record<string, unknown>>;
}

const steps = ['Select File', 'Validate', 'Import'];

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [importType, setImportType] = useState<ImportType>('materials');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    importedCount?: number;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setValidationResult(null);
      setImportResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleValidate = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    try {
      const result = await importService.validate(selectedFile, importType);
      setValidationResult(result);
      if (result.isValid) {
        setActiveStep(1);
      }
    } catch (error) {
      toast.error('Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.isValid) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      let result;
      if (importType === 'materials') {
        result = await importService.importMaterials(selectedFile);
      } else {
        result = await importService.importProject(selectedFile);
      }

      clearInterval(progressInterval);
      setImportProgress(100);

      const hasErrors = result.failedImports > 0;
      setImportResult({
        success: true,
        message: hasErrors
          ? `Imported ${result.successfulImports} of ${result.totalRows} records. ${result.failedImports} failed.`
          : `Successfully imported ${result.successfulImports} records`,
        importedCount: result.successfulImports,
      });
      setActiveStep(2);
      if (hasErrors) {
        toast.success(`Import completed with ${result.failedImports} errors`);
      } else {
        toast.success('Import completed successfully');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setImportResult({
        success: false,
        message: errorMessage,
      });
      toast.error('Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await importService.downloadTemplate(importType);
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setValidationResult(null);
    setImportResult(null);
    setImportProgress(0);
  };

  return (
    <Box>
      <PageHeader
        title="Import Data"
        subtitle="Import materials or projects from Excel files"
        breadcrumbs={[{ label: 'Import' }]}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Stepper activeStep={activeStep} sx={{ mb: { xs: 2, sm: 4 } }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Import Type Selection */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Import Type
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Card
                variant={importType === 'materials' ? 'elevated' : 'outlined'}
                onClick={() => setImportType('materials')}
                sx={{
                  cursor: 'pointer',
                  border: importType === 'materials' ? 2 : 1,
                  borderColor: importType === 'materials' ? 'primary.main' : 'divider',
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Materials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Import material catalog from Excel
                  </Typography>
                </Box>
              </Card>
              <Card
                variant={importType === 'project' ? 'elevated' : 'outlined'}
                onClick={() => setImportType('project')}
                sx={{
                  cursor: 'pointer',
                  border: importType === 'project' ? 2 : 1,
                  borderColor: importType === 'project' ? 'primary.main' : 'divider',
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Project
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Import project with panels and items
                  </Typography>
                </Box>
              </Card>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="ghost"
                icon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                fullWidth
              >
                Download Template
              </Button>
            </Box>
          </Grid>

          {/* File Upload */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <>
                <Box
                  {...getRootProps()}
                  sx={{
                    p: 6,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    backgroundColor: isDragActive ? 'action.hover' : 'grey.50',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse (Excel files only)
                  </Typography>
                </Box>

                {selectedFile && (
                  <Box sx={{ mt: 3 }}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <InsertDriveFileIcon sx={{ color: 'success.main', fontSize: 40 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                      <Button
                        variant="primary"
                        onClick={handleValidate}
                        loading={isValidating}
                      >
                        Validate
                      </Button>
                    </Paper>
                  </Box>
                )}

                {validationResult && !validationResult.isValid && (
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Validation failed. Please fix the following errors:
                    </Alert>
                    <List dense>
                      {validationResult.errors.map((error, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ErrorIcon color="error" />
                          </ListItemIcon>
                          <ListItemText primary={error} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </>
            )}

            {activeStep === 1 && validationResult && (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  File validated successfully. Ready to import {validationResult.rowCount} records.
                </Alert>

                {validationResult.warnings.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Warnings:
                    </Typography>
                    <List dense disablePadding>
                      {validationResult.warnings.map((warning, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={warning} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                {validationResult.previewData.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Preview (first 5 rows)
                    </Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {Object.keys(validationResult.previewData[0]).map((key) => (
                              <TableCell key={key}>{key}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {validationResult.previewData.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value, colIndex) => (
                                <TableCell key={colIndex}>
                                  {String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Box>
                )}

                {isImporting && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Importing... {importProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={importProgress} />
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="ghost" onClick={handleReset}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleImport}
                    loading={isImporting}
                  >
                    Start Import
                  </Button>
                </Box>
              </>
            )}

            {activeStep === 2 && importResult && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                {importResult.success ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Import Completed!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {importResult.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button variant="ghost" onClick={handleReset}>
                        Import Another
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() =>
                          navigate(importType === 'materials' ? '/materials' : '/projects')
                        }
                      >
                        View {importType === 'materials' ? 'Materials' : 'Projects'}
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Import Failed
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {importResult.message}
                    </Typography>
                    <Button variant="primary" onClick={handleReset}>
                      Try Again
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ImportPage;
