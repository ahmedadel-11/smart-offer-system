import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { PageHeader, Button } from '../../components';
import { EnclosureCategoriesControl } from '../../components/materials';
import { useAuth } from '../../contexts';
import toast from 'react-hot-toast';

interface Settings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultCurrency: string;
  defaultVatRate: number;
  pdfLogoUrl: string;
  enableNotifications: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number;
  defaultValidityDays: number;
  termsAndConditions: string;
}

const defaultSettings: Settings = {
  companyName: 'Electric Technology',
  companyAddress: '5 Fawzy Moaaz Street – Semouha - Alexandria',
  companyPhone: '(03) 4248224',
  companyEmail: 'info@electech.com',
  defaultCurrency: 'EGP',
  defaultVatRate: 20,
  pdfLogoUrl: '',
  enableNotifications: true,
  enableAutoSave: true,
  autoSaveInterval: 30,
  defaultValidityDays: 30,
  termsAndConditions:
    '1. Prices are valid for 30 days from the date of this offer.\n2. Delivery time: 4-6 weeks after order confirmation.\n3. Payment terms: 50% advance, 50% before delivery.\n4. All prices exclude installation.',
};

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = useAuth();
  const canViewRates = hasAnyPermission(['CurrencyRates.View', 'CurrencyRates.Manage']);
  const canConfigureRates = hasPermission('CurrencyRates.Manage');

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('smartoffer_settings');
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return defaultSettings;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof Settings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to the backend
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem('smartoffer_settings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.success('Settings reset to defaults');
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Configure application preferences"
        breadcrumbs={[{ label: 'Settings' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="ghost" icon={<RefreshIcon />} onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button
              variant="primary"
              icon={<SaveIcon />}
              onClick={handleSave}
              loading={isSaving}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Box>
        }
      />

      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have unsaved changes. Don't forget to save before leaving.
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Company Information */}
        <Grid item xs={12}>
          <Paper
            sx={(theme) => ({
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            })}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CurrencyExchangeIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Currency Rate Management
                  </Typography>
                  {!canConfigureRates && <Chip size="small" label="Read Only" />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Configure exchange rates used for commercial offer outputs and project currency conversions.
                </Typography>
              </Box>
              <Button
                variant="primary"
                onClick={() => navigate('/settings/currency-rates')}
                disabled={!canViewRates}
              >
                Open Currency Rates
              </Button>
              {!canConfigureRates && (
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                  Requires CurrencyRates.Manage permission to edit rates.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Company Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This information will appear on generated offers.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                fullWidth
              />
              <TextField
                label="Address"
                value={settings.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Phone"
                value={settings.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
                fullWidth
              />
              <TextField
                label="Email"
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                fullWidth
                type="email"
              />
              <TextField
                label="Logo URL (for PDF)"
                value={settings.pdfLogoUrl}
                onChange={(e) => handleChange('pdfLogoUrl', e.target.value)}
                fullWidth
                placeholder="https://example.com/logo.png"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Financial Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Financial Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure default financial parameters for offers.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Default Currency"
                value={settings.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                fullWidth
              />
              <TextField
                label="Default VAT Rate (%)"
                value={settings.defaultVatRate}
                onChange={(e) => handleChange('defaultVatRate', parseFloat(e.target.value) || 0)}
                fullWidth
                type="number"
              />
              <TextField
                label="Offer Validity (days)"
                value={settings.defaultValidityDays}
                onChange={(e) =>
                  handleChange('defaultValidityDays', parseInt(e.target.value) || 30)
                }
                fullWidth
                type="number"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Application Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure application behavior.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                  />
                }
                label="Enable Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAutoSave}
                    onChange={(e) => handleChange('enableAutoSave', e.target.checked)}
                  />
                }
                label="Enable Auto-Save"
              />
              {settings.enableAutoSave && (
                <TextField
                  label="Auto-Save Interval (seconds)"
                  value={settings.autoSaveInterval}
                  onChange={(e) =>
                    handleChange('autoSaveInterval', parseInt(e.target.value) || 30)
                  }
                  fullWidth
                  type="number"
                  sx={{ ml: 4 }}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Terms & Conditions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Terms & Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Default terms that will appear on offers.
            </Typography>

            <TextField
              label="Terms & Conditions"
              value={settings.termsAndConditions}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              fullWidth
              multiline
              rows={8}
            />
          </Paper>
        </Grid>

        {/* Enclosure Categories */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <EnclosureCategoriesControl />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
