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
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PrintIcon from '@mui/icons-material/Print';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { PageHeader, Button, Loading } from '../../components';
import { useProject, useProjectTotalPrice } from '../../hooks';
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

  if (isLoading) {
    return <Loading fullScreen message="Loading project..." />;
  }

  if (!project) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: project.currency || 'EGP',
    }).format(amount);
  };

  return (
    <Box>
      <PageHeader
        title="Generate Offer"
        subtitle={project.projectName}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project.projectName, path: `/projects/${project.projectId}` },
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

            {/* Header Preview */}
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
                    SO-{new Date().getFullYear()}-{String(project.projectId).padStart(4, '0')}
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
                      {project.projectName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {project.customer}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Currency
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {project.currency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {project.createdAt
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
                      {EntityStatusLabels[project.status as EntityStatus] || project.status}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfferGeneratorPage;
