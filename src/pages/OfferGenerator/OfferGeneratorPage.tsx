import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PrintIcon from '@mui/icons-material/Print';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { PageHeader, Button, Loading } from '../../components';
import { useProject, useProjectTotalPrice, useTechnicalOfferData, useCommercialOfferData } from '../../hooks';
import { offerService } from '../../services/offerService';
import { projectService } from '../../services/projectService';
import { EntityStatusLabels, EntityStatus } from '../../types';
import toast from 'react-hot-toast';

type OfferType = 'commercial' | 'technical';

export const OfferGeneratorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || '0');

  const [offerType, setOfferType] = useState<OfferType>('commercial');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: project, isLoading } = useProject(projectId);
  const { data: totalPriceData } = useProjectTotalPrice(projectId);
  const { data: technicalOfferData, isLoading: technicalLoading, error: technicalError } = useTechnicalOfferData(projectId);
  const { data: commercialOfferData, isLoading: commercialLoading, error: commercialError } = useCommercialOfferData(projectId);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: OfferType | null) => {
    if (newType) setOfferType(newType);
  };

  const handleDownloadPdf = async () => {
    if (!project) return;

    setIsGenerating(true);
    try {
      const doc =
        offerType === 'commercial'
          ? offerService.generateCommercialOfferPdf(project)
          : offerService.generateTechnicalOfferPdf(project);

      const filename = `${project.projectName}_${offerType}_offer`;
      offerService.downloadPdf(doc, filename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!project) return;

    setIsGenerating(true);
    try {
      const workbook = offerService.exportToExcel(project);
      const filename = `${project.projectName}_offer`;
      offerService.downloadExcel(workbook, filename);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate Excel');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!project) return;

    setIsGenerating(true);
    try {
      const doc =
        offerType === 'commercial'
          ? offerService.generateCommercialOfferPdf(project)
          : offerService.generateTechnicalOfferPdf(project);

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      toast.error('Failed to print');
    } finally {
      setIsGenerating(false);
    }
  };

  // Backend-generated PDF downloads
  const handleDownloadBackendPdf = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      const blob =
        offerType === 'commercial'
          ? await projectService.exportCommercialOfferPdf(projectId)
          : await projectService.exportTechnicalOfferPdf(projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.projectName}-${offerType}-offer.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${offerType === 'commercial' ? 'Commercial' : 'Technical'} offer PDF downloaded`);
    } catch {
      toast.error('Failed to download server-generated PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMaterialList = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      const blob = await projectService.exportMaterialList(projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.projectName}-material-list.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Material list exported');
    } catch {
      toast.error('Failed to export material list');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportOfferExcel = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      const blob = await projectService.exportOffer(projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.projectName}-offer.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Offer Excel exported');
    } catch {
      toast.error('Failed to export offer Excel');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = commercialOfferData?.currency || project?.currency || 'EGP';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (isLoading && !project) {
    return <Loading fullScreen message="Loading project..." />;
  }

  if (!project && !technicalOfferData && !commercialOfferData) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">
          Project not found
        </Typography>
        <Button variant="ghost" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Generate Offer"
        subtitle={project?.projectName || commercialOfferData?.projectName || technicalOfferData?.projectName || 'Offer'}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project?.projectName || 'Project', path: project?.projectId ? `/projects/${project.projectId}` : undefined },
          { label: 'Generate Offer' },
        ]}
        backButton={{ label: 'Back' }}
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Offer Options */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Offer Type
            </Typography>
            <ToggleButtonGroup
              value={offerType}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="commercial">Commercial</ToggleButton>
              <ToggleButton value="technical">Technical</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {offerType === 'commercial'
                ? 'Commercial offer focuses on pricing, totals, and payment terms for customers.'
                : 'Technical offer includes detailed specifications, ratings, and product information.'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Export Options
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="primary"
                icon={<CloudDownloadIcon />}
                onClick={handleDownloadBackendPdf}
                loading={isGenerating}
                fullWidth
              >
                Download PDF (Server)
              </Button>
              <Button
                variant="outline"
                icon={<PictureAsPdfIcon />}
                onClick={handleDownloadPdf}
                loading={isGenerating}
                fullWidth
              >
                Download PDF (Client)
              </Button>
              <Button
                variant="outline"
                icon={<TableChartIcon />}
                onClick={handleExportOfferExcel}
                loading={isGenerating}
                fullWidth
              >
                Export Offer Excel
              </Button>
              <Button
                variant="outline"
                icon={<ListAltIcon />}
                onClick={handleExportMaterialList}
                loading={isGenerating}
                fullWidth
              >
                Export Material List
              </Button>
              <Button
                variant="outline"
                icon={<TableChartIcon />}
                onClick={handleDownloadExcel}
                loading={isGenerating}
                fullWidth
              >
                Export Excel (Client)
              </Button>
              <Button
                variant="ghost"
                icon={<PrintIcon />}
                onClick={handlePrint}
                loading={isGenerating}
                fullWidth
              >
                Print
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Offer Preview
            </Typography>

            {/* Show loading state for API data */}
            {(technicalLoading || commercialLoading) && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Loading message="Loading offer data..." />
              </Box>
            )}

            {/* Show error if occurred */}
            {(technicalError && offerType === 'technical') || (commercialError && offerType === 'commercial') ? (
              <Box sx={{ p: 2, backgroundColor: 'error.light', borderRadius: 1, color: 'error.main' }}>
                <Typography>Failed to load {offerType} offer data. Please try again.</Typography>
              </Box>
            ) : (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'grey.50',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 3, gap: 1 }}>
                <Box>
                  <Typography variant="h5" color="primary.main" fontWeight={700}>
                    SmartOffer Electric
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    123 Business Street, City, Country
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Offer No
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    SO-{new Date().getFullYear()}-{String(projectId).padStart(4, '0')}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h4"
                textAlign="center"
                sx={{ my: { xs: 2, sm: 3 }, textTransform: 'uppercase', fontSize: { xs: '1.25rem', sm: '2.125rem' } }}
              >
                {offerType === 'commercial' ? 'Commercial' : 'Technical'} Offer
              </Typography>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Project
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {commercialOfferData?.projectName || technicalOfferData?.projectName || project?.projectName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {commercialOfferData?.customer || technicalOfferData?.customer || project?.customer}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Currency
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {commercialOfferData?.currency || project?.currency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {commercialOfferData?.date 
                        ? new Date(commercialOfferData.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : project?.createdAt
                        ? new Date(project.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {commercialOfferData?.status || EntityStatusLabels[project?.status as EntityStatus] || project?.status}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Technical Offer Content */}
              {offerType === 'technical' && technicalOfferData && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                    Technical Specifications
                  </Typography>
                  {technicalOfferData.panels.map((panel, panelIndex) => (
                    <Box key={panelIndex} sx={{ mb: 3 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
                        Panel {panelIndex + 1}: {panel.panelName}
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ 
                              backgroundColor: '#0D47A1',
                              '& .MuiTableCell-head': {
                                color: '#FFFFFF !important',
                                fontWeight: '700 !important',
                                fontSize: '0.95rem',
                                padding: '14px 10px !important',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                borderBottom: '3px solid #1565C0'
                              }
                            }}>
                              <TableCell sx={{ color: 'white !important' }}>Code</TableCell>
                              <TableCell sx={{ color: 'white !important' }}>Description</TableCell>
                              <TableCell sx={{ color: 'white !important' }}>Brand</TableCell>
                              <TableCell align="center" sx={{ color: 'white !important' }}>Rated Current</TableCell>
                              <TableCell align="center" sx={{ color: 'white !important' }}>ISC</TableCell>
                              <TableCell align="center" sx={{ color: 'white !important' }}>Poles</TableCell>
                              <TableCell align="center" sx={{ color: 'white !important' }}>Qty</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {panel.items.map((item, itemIndex) => (
                              <TableRow key={itemIndex} sx={{ 
                                '&:hover': { backgroundColor: '#E3F2FD' },
                                '&:nth-of-type(odd)': { backgroundColor: '#F5F5F5' }
                              }}>
                                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.itemCode}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.description}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.875rem' }}>{item.brand || '-'}</TableCell>
                                <TableCell align="center" sx={{ fontSize: '0.875rem' }}>
                                  {item.ratedCurrent || '-'}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '0.875rem' }}>
                                  {item.isc || '-'}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '0.875rem' }}>
                                  {item.poles || '-'}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D47A1' }}>
                                  {item.quantity}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Commercial Offer Content */}
              {offerType === 'commercial' && commercialOfferData && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                    Commercial Summary
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ 
                          backgroundColor: '#00695C',
                          '& .MuiTableCell-head': {
                            color: '#FFFFFF !important',
                            fontWeight: '700 !important',
                            fontSize: '0.95rem',
                            padding: '14px 10px !important',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '3px solid #00897B'
                          }
                        }}>
                          <TableCell sx={{ color: 'white !important' }}>Panel</TableCell>
                          <TableCell align="center" sx={{ color: 'white !important' }}>Items</TableCell>
                          <TableCell align="right" sx={{ color: 'white !important' }}>Total Cost</TableCell>
                          <TableCell align="right" sx={{ color: 'white !important' }}>Margin</TableCell>
                          <TableCell align="right" sx={{ color: 'white !important' }}>Total Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commercialOfferData.panels.map((panel, index) => (
                          <TableRow key={index} sx={{ 
                            '&:hover': { backgroundColor: '#E0F2F1' },
                            '&:nth-of-type(odd)': { backgroundColor: '#F5F5F5' }
                          }}>
                            <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{panel.name}</TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.875rem' }}>
                              {panel.items}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.875rem' }}>
                              {formatCurrency(panel.totalCost)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.875rem', color: '#00897B', fontWeight: 700 }}>
                              {formatCurrency(panel.marginAmount)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#00695C' }}>
                              {formatCurrency(panel.totalPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Grand Totals */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#E0F2F1', borderRadius: 1, border: '2px solid #00897B' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: '#004D40', fontWeight: 600 }}>
                          Total Items
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ color: '#00695C', fontSize: '1.1rem' }}>
                          {commercialOfferData.grandTotalItems}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: '#004D40', fontWeight: 600 }}>
                          Total Cost
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ color: '#00695C', fontSize: '1.1rem' }}>
                          {formatCurrency(commercialOfferData.grandTotalCost)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: '#004D40', fontWeight: 600 }}>
                          Total Margin
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ color: '#00897B', fontSize: '1.1rem' }}>
                          {formatCurrency(commercialOfferData.grandTotalMargin)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: '#004D40', fontWeight: 600 }}>
                          Grand Total
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#00695C', fontSize: '1.2rem' }}>
                          {formatCurrency(commercialOfferData.grandTotalPrice)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}

              {/* Fallback to project data if API data not available */}
              {!technicalOfferData && !commercialOfferData && project && (
                <Box>
                  {/* Panel Summary */}
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Summary
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {project.panels.map((panel, index) => (
                      <Box
                        key={panel.panelId}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2">
                          {index + 1}. {panel.panelName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {panel.items?.length || 0} items
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(panel.summary?.totalPrice || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Pricing Detail */}
                  {totalPriceData && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Total Items</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight={600} textAlign="right">
                            {totalPriceData.totalItems}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight={600} textAlign="right">
                            {formatCurrency(totalPriceData.totalCost)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Margin</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight={600} textAlign="right" color="success.main">
                            {formatCurrency(totalPriceData.totalMarginAmount)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Total */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      p: 2,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">GRAND TOTAL</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {formatCurrency(totalPriceData?.totalPrice ?? project.totalPrice ?? 0)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfferGeneratorPage;
