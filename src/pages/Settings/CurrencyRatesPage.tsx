import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PageHeader, Button, Loading } from '../../components';
import { useCurrencyRates, useUpsertCurrencyRate } from '../../hooks';
import { useAuth } from '../../contexts';
import type { CurrencyRateDto } from '../../types';
import { parseUtcTimestamp } from '../../utils';

const formatDateTime = (date: string): string => {
  const parsed = parseUtcTimestamp(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleString();
};

export const CurrencyRatesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canConfigure = hasPermission('CurrencyRates.Manage');

  const { data: rates = [], isLoading, isError } = useCurrencyRates();
  const updateRateMutation = useUpsertCurrencyRate();

  const [editingRate, setEditingRate] = useState<CurrencyRateDto | null>(null);
  const [rateToEgpInput, setRateToEgpInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const sortedRates = useMemo(() => {
    return [...rates].sort((a, b) => a.currencyCode.localeCompare(b.currencyCode));
  }, [rates]);

  const openEditDialog = (rate: CurrencyRateDto) => {
    setEditingRate(rate);
    setRateToEgpInput(String(rate.rateToEgp));
    setValidationError(null);
  };

  const closeEditDialog = () => {
    setEditingRate(null);
    setRateToEgpInput('');
    setValidationError(null);
  };

  const handleSaveRate = async () => {
    if (!editingRate) {
      return;
    }

    const parsedRate = Number(rateToEgpInput);

    if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
      setValidationError('Rate must be greater than 0.');
      return;
    }

    if (editingRate.currencyCode.toUpperCase() === 'EGP' && parsedRate !== 1) {
      setValidationError('EGP must stay fixed at 1.');
      return;
    }

    await updateRateMutation.mutateAsync({
      currencyCode: editingRate.currencyCode,
      data: { rateToEgp: parsedRate },
    });

    closeEditDialog();
  };

  if (isLoading) {
    return <Loading message="Loading currency rates..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Currency Rates"
        subtitle="Manage conversion rates against EGP for offer outputs"
        breadcrumbs={[{ label: 'Settings', path: '/settings' }, { label: 'Currency Rates' }]}
      />

      {!canConfigure && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view rates, but only users with CurrencyRates.Manage can update them.
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load currency rates.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <CurrencyExchangeIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Conversion rule: target amount = amount in EGP / rateToEgp.
          </Typography>
          <Tooltip title="Example: if USD = 50, then 5000 EGP = 100 USD.">
            <InfoOutlinedIcon color="action" fontSize="small" />
          </Tooltip>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Currency</TableCell>
              <TableCell>Rate To EGP</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No currency rates configured.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedRates.map((rate) => {
                const isBaseCurrency = rate.currencyCode.toUpperCase() === 'EGP';

                return (
                  <TableRow key={rate.currencyCode} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {rate.currencyCode.toUpperCase()}
                        </Typography>
                        {isBaseCurrency && <Chip size="small" label="Base" color="primary" variant="outlined" />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rate.rateToEgp}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(rate.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        icon={<EditIcon />}
                        onClick={() => openEditDialog(rate)}
                        disabled={!canConfigure}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editingRate} onClose={closeEditDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Update {editingRate?.currencyCode?.toUpperCase()} Rate
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Enter how many EGP equal 1 {editingRate?.currencyCode?.toUpperCase()}.
            </Typography>
            <TextField
              label="Rate To EGP"
              value={rateToEgpInput}
              onChange={(e) => {
                setRateToEgpInput(e.target.value);
                if (validationError) {
                  setValidationError(null);
                }
              }}
              fullWidth
              type="number"
              inputProps={{ min: 0.000001, step: 'any' }}
              error={!!validationError}
              helperText={validationError || 'Must be greater than 0'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={closeEditDialog}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveRate}
            loading={updateRateMutation.isPending}
            disabled={!canConfigure}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CurrencyRatesPage;
