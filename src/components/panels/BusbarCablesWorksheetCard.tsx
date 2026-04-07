import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import CableIcon from '@mui/icons-material/Cable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PanelItem, BusbarCablesWorksheetPayload } from '../../types';

interface BusbarCablesWorksheetCardProps {
  item: PanelItem;
  worksheet?: BusbarCablesWorksheetPayload | null;
  currency?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const formatKg = (value: number) =>
  new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const toNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeWorksheetResult = (result: any) => ({
  mainBusbar: result?.mainBusbar ?? result?.MainBusbar ?? [],
  neutralEarthBar: result?.neutralEarthBar ?? result?.NeutralEarthBar ?? [],
  connection: result?.connection ?? result?.Connection ?? [],
  mainBusbarTotalKg: toNumber(result?.mainBusbarTotalKg ?? result?.MainBusbarTotalKg),
  neutralEarthTotalKg: toNumber(result?.neutralEarthTotalKg ?? result?.NeutralEarthTotalKg),
  connectionTotalKg: toNumber(result?.connectionTotalKg ?? result?.ConnectionTotalKg),
  grandTotalKg: toNumber(result?.grandTotalKg ?? result?.GrandTotalKg),
});

const normalizePricing = (pricing: any) => {
  if (!pricing) {
    return undefined;
  }

  return {
    defaultPricePerKg: toNumber(pricing?.defaultPricePerKg ?? pricing?.DefaultPricePerKg),
    appliedPricePerKg: toNumber(pricing?.appliedPricePerKg ?? pricing?.AppliedPricePerKg),
    priceSource: pricing?.priceSource ?? pricing?.PriceSource ?? 'Default',
    totalKg: toNumber(pricing?.totalKg ?? pricing?.TotalKg),
    totalCost: toNumber(pricing?.totalCost ?? pricing?.TotalCost),
  };
};

const safeParseWorksheet = (notes: string | null): BusbarCablesWorksheetPayload | null => {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes) as any;
    const result = normalizeWorksheetResult(parsed?.result ?? parsed?.Result);

    const normalized: BusbarCablesWorksheetPayload = {
      panelItemId: parsed?.panelItemId ?? parsed?.PanelItemId ?? 0,
      panelId: parsed?.panelId ?? parsed?.PanelId ?? 0,
      input: parsed?.input ?? parsed?.Input ?? { mainBusbar: [], neutralEarthBar: [], connection: [] },
      result,
      pricing: normalizePricing(parsed?.pricing ?? parsed?.Pricing),
    };

    if (normalized?.result && Number.isFinite(normalized.result.grandTotalKg)) {
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
};

export const BusbarCablesWorksheetCard: React.FC<BusbarCablesWorksheetCardProps> = ({
  item,
  worksheet,
  currency = 'EGP',
  onEdit,
  onDelete,
}) => {
  const payload = worksheet ?? safeParseWorksheet(item.notes);
  const result = payload?.result;
  const pricing = payload?.pricing;
  const sections = [
    {
      label: 'Main Busbar',
      value: result?.mainBusbarTotalKg ?? 0,
    },
    {
      label: 'Neutral + Earth',
      value: result?.neutralEarthTotalKg ?? 0,
    },
    {
      label: 'Connection',
      value: result?.connectionTotalKg ?? 0,
    },
  ];

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'secondary.light',
        background: 'linear-gradient(135deg, rgba(156,39,176,0.08) 0%, rgba(25,118,210,0.06) 100%)',
        boxShadow: '0px 2px 10px rgba(25, 118, 210, 0.08)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'secondary.main',
              color: 'white',
              flexShrink: 0,
            }}
          >
            <CableIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Busbar & Cables Worksheet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Engineering calculation sheet stored as one panel item
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`${formatKg(result?.grandTotalKg ?? 0)} kg`}
          color="secondary"
          sx={{ fontWeight: 700, borderRadius: 999 }}
        />
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        {sections.map((section) => (
          <Chip
            key={section.label}
            label={`${section.label}: ${formatKg(section.value)} kg`}
            size="small"
            variant="outlined"
            sx={{ backgroundColor: 'white' }}
          />
        ))}
        {pricing && (
          <>
            <Chip
              label={`Price Source: ${pricing.priceSource}`}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: 'white' }}
            />
            <Chip
              label={`Applied Price/KG: ${formatMoney(pricing.appliedPricePerKg, currency)}`}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: 'white' }}
            />
            <Chip
              label={`Total Cost: ${formatMoney(pricing.totalCost, currency)}`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
          </>
        )}
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {payload ? `Panel item #${payload.panelItemId}` : `Saved worksheet row #${item.panelItemId}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
            Edit
          </Button>
          <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}>
            Delete
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default BusbarCablesWorksheetCard;
