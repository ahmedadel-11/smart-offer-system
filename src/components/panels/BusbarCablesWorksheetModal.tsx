import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Collapse,
  Radio,
  RadioGroup,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCalculateBusbarCablesWorksheet, useSaveBusbarCablesWorksheet } from '../../hooks';
import {
  BusbarCablesWorksheetInput,
  BusbarCablesWorksheetPayload,
  BusbarCablesWorksheetResult,
} from '../../types';

const COEFFICIENT = 1.221;
const KG_FORMATTER = new Intl.NumberFormat('en-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const METERS_FORMATTER = new Intl.NumberFormat('en-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const MONEY_FORMATTERS = new Map<string, Intl.NumberFormat>();

const MAIN_BUSBAR_ROWS = [
  '(20*5)',
  '(25*5)',
  '(32*5)',
  '(40*5)',
  '(50*5)',
  '(60*5)',
  '(80*5)',
  '(100*5)',
  '(120*5)',
  '(125*5)',
  '(25*10)',
  '(32*10)',
  '(40*10)',
  '(50*10)',
  '(60*10)',
  '(80*10)',
  '(100*10)',
  '(120*10)',
  '(125*10)',
];

const NEUTRAL_EARTH_ROWS = [
  '(25*5)',
  '(30*5)',
  '(40*5)',
  '(50*5)',
  '(60*5)',
  '(80*5)',
  '(100*5)',
  '(120*5)',
  '(125*5)',
  '(25*10)',
  '(32*10)',
  '(40*10)',
  '(50*10)',
  '(60*10)',
  '(80*10)',
  '(100*10)',
  '(120*10)',
  '(125*10)',
];

const CONNECTION_ROWS = [
  '(25*5)',
  '(50*5)',
  '(25*10)',
  '(30*10)',
  '(50*10)',
  '(60*10)',
  '(80*10)',
  '(100*10)',
  '(120*10)',
  '(125*10)',
];

type MainRow = {
  size: string;
  bars: number;
  poles: number;
  vrMeters: number;
  horizontalMeters: number;
};

type NeutralRow = {
  size: string;
  bars: number;
  neutralMeters: number;
  earthMeters: number;
};

type ConnectionRow = {
  size: string;
  bars: number;
  poles: number;
  customMeters: number;
  bbMeters: number;
};

type WorksheetState = {
  mainBusbar: MainRow[];
  neutralEarthBar: NeutralRow[];
  connection: ConnectionRow[];
};

interface BusbarCablesWorksheetModalProps {
  open: boolean;
  panelId: number;
  title?: string;
  worksheet?: BusbarCablesWorksheetPayload | null;
  defaultPricePerKg?: number;
  currency?: string;
  onClose: () => void;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const toNumber = (value: string | number) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildDefaultWorksheet = (): WorksheetState => ({
  mainBusbar: MAIN_BUSBAR_ROWS.map((size) => ({
    size,
    bars: 0,
    poles: 0,
    vrMeters: 0,
    horizontalMeters: 0,
  })),
  neutralEarthBar: NEUTRAL_EARTH_ROWS.map((size) => ({
    size,
    bars: 0,
    neutralMeters: 0,
    earthMeters: 0,
  })),
  connection: CONNECTION_ROWS.map((size) => ({
    size,
    bars: 0,
    poles: 0,
    customMeters: 0,
    bbMeters: 0,
  })),
});

const fromSavedWorksheet = (worksheet?: BusbarCablesWorksheetPayload | null): WorksheetState => {
  if (!worksheet?.input) {
    return buildDefaultWorksheet();
  }

  const defaults = buildDefaultWorksheet();
  return {
    mainBusbar: defaults.mainBusbar.map((row) => {
      const saved = worksheet.input.mainBusbar.find((item) => item.size === row.size);
      return saved ? { ...row, ...saved } : row;
    }),
    neutralEarthBar: defaults.neutralEarthBar.map((row) => {
      const saved = worksheet.input.neutralEarthBar.find((item) => item.size === row.size);
      return saved ? { ...row, ...saved } : row;
    }),
    connection: defaults.connection.map((row) => {
      const saved = worksheet.input.connection.find((item) => item.size === row.size);
      return saved ? { ...row, ...saved } : row;
    }),
  };
};

const computeWorksheet = (state: WorksheetState): BusbarCablesWorksheetResult => {
  const mainBusbar = state.mainBusbar.map((row) => {
    const totalMeters = round2(row.vrMeters + row.horizontalMeters);
    const totalKg = round2(row.bars * row.poles * totalMeters * COEFFICIENT);
    return { ...row, totalMeters, totalKg };
  });

  const neutralEarthBar = state.neutralEarthBar.map((row) => {
    const totalMeters = round2(row.neutralMeters + row.earthMeters);
    const totalKg = round2(row.bars * totalMeters * COEFFICIENT);
    return { ...row, totalMeters, totalKg };
  });

  const connection = state.connection.map((row) => {
    const totalMeters = round2(row.customMeters + row.bbMeters);
    const totalKg = round2(row.bars * row.poles * totalMeters * COEFFICIENT);
    return { ...row, totalMeters, totalKg };
  });

  const mainBusbarTotalKg = round2(mainBusbar.reduce((sum, row) => sum + row.totalKg, 0));
  const neutralEarthTotalKg = round2(neutralEarthBar.reduce((sum, row) => sum + row.totalKg, 0));
  const connectionTotalKg = round2(connection.reduce((sum, row) => sum + row.totalKg, 0));

  return {
    mainBusbar,
    neutralEarthBar,
    connection,
    mainBusbarTotalKg,
    neutralEarthTotalKg,
    connectionTotalKg,
    grandTotalKg: round2(mainBusbarTotalKg + neutralEarthTotalKg + connectionTotalKg),
  };
};

const toCompactWorksheetInput = (state: WorksheetState): BusbarCablesWorksheetInput => {
  const mainBusbar = state.mainBusbar
    .filter((row) => row.bars > 0 || row.poles > 0 || row.vrMeters > 0 || row.horizontalMeters > 0)
    .map((row) => ({
      size: row.size,
      bars: Math.max(0, Math.trunc(row.bars)),
      poles: Math.max(0, Math.trunc(row.poles)),
      vrMeters: Math.max(0, row.vrMeters),
      horizontalMeters: Math.max(0, row.horizontalMeters),
    }));

  const neutralEarthBar = state.neutralEarthBar
    .filter((row) => row.bars > 0 || row.neutralMeters > 0 || row.earthMeters > 0)
    .map((row) => ({
      size: row.size,
      bars: Math.max(0, Math.trunc(row.bars)),
      neutralMeters: Math.max(0, row.neutralMeters),
      earthMeters: Math.max(0, row.earthMeters),
    }));

  const connection = state.connection
    .filter((row) => row.bars > 0 || row.poles > 0 || row.customMeters > 0 || row.bbMeters > 0)
    .map((row) => ({
      size: row.size,
      bars: Math.max(0, Math.trunc(row.bars)),
      poles: Math.max(0, Math.trunc(row.poles)),
      customMeters: Math.max(0, row.customMeters),
      bbMeters: Math.max(0, row.bbMeters),
    }));

  return {
    mainBusbar,
    neutralEarthBar,
    connection,
  };
};

const formatKg = (value: number) =>
  KG_FORMATTER.format(value);

const getMoneyFormatter = (currency: string) => {
  const existing = MONEY_FORMATTERS.get(currency);
  if (existing) {
    return existing;
  }

  const formatter = new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  MONEY_FORMATTERS.set(currency, formatter);
  return formatter;
};

const formatMoney = (value: number, currency: string) =>
  getMoneyFormatter(currency).format(value);

const formatMeters = (value: number) =>
  METERS_FORMATTER.format(value);

const SectionHeader: React.FC<{
  label: string;
  color: string;
  totalKg: number;
  open: boolean;
  onToggle: () => void;
}> = ({
  label,
  color,
  totalKg,
  open,
  onToggle,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 1.25,
      borderRadius: '12px 12px 0 0',
      background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.82)} 100%)`,
      color: 'common.white',
      cursor: 'pointer',
      userSelect: 'none',
    }}
    role="button"
    tabIndex={0}
    onClick={onToggle}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggle();
      }
    }}
  >
    <Typography variant="subtitle1" fontWeight={700}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={`${formatKg(totalKg)} kg`}
        size="small"
        sx={{ backgroundColor: (theme) => alpha(theme.palette.common.white, 0.18), color: 'common.white', fontWeight: 700 }}
      />
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        size="small"
        sx={{ color: 'common.white' }}
      >
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
  </Box>
);

const EditableCell: React.FC<{
  value: number;
  onChange: (value: number) => void;
  width?: number;
  textAlign?: 'left' | 'center' | 'right';
  accent: string;
  step?: number;
  integer?: boolean;
}> = ({ value, onChange, width = 92, textAlign = 'center', accent, step = 0.1, integer = false }) => (
  <TextField
    type="number"
    variant="standard"
    value={value}
    onChange={(event) => {
      const parsed = toNumber(event.target.value);
      const sanitized = Math.max(0, integer ? Math.trunc(parsed) : parsed);
      onChange(sanitized);
    }}
    InputProps={{ disableUnderline: true }}
    inputProps={{
      min: 0,
      step,
      style: { textAlign, width: '100%' },
    }}
    sx={{
      width,
      '& .MuiInput-root': {
        px: 1,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: `${accent}10`,
        border: '1px solid',
        borderColor: `${accent}30`,
        fontFamily: 'Roboto Mono',
      },
      '& input': {
        fontFamily: 'Roboto Mono',
        fontSize: 14,
      },
    }}
  />
);

const ReadOnlyCell: React.FC<{ value: number; strong?: boolean }> = ({ value, strong = false }) => (
  <Typography variant={strong ? 'body2' : 'body2'} fontWeight={strong ? 700 : 500} sx={{ fontFamily: 'Roboto Mono' }}>
    {formatMeters(value)}
  </Typography>
);

export const BusbarCablesWorksheetModal: React.FC<BusbarCablesWorksheetModalProps> = ({
  open,
  panelId,
  title = 'Busbar & Cables Worksheet',
  worksheet,
  defaultPricePerKg,
  currency = 'EGP',
  onClose,
}) => {
  const theme = useTheme();
  const sectionAccents = useMemo(
    () => ({
      main: theme.palette.primary.main,
      neutral: theme.palette.info.main,
      connection: theme.palette.secondary.dark,
    }),
    [theme]
  );

  const [state, setState] = useState<WorksheetState>(buildDefaultWorksheet());
  const [priceMode, setPriceMode] = useState<'default' | 'manual'>('default');
  const [manualPricePerKg, setManualPricePerKg] = useState(0);
  const [sectionOpen, setSectionOpen] = useState({
    mainBusbar: true,
    neutralEarthBar: false,
    connection: false,
  });
  const calculateMutation = useCalculateBusbarCablesWorksheet();
  const saveMutation = useSaveBusbarCablesWorksheet();

  useEffect(() => {
    if (open) {
      setState(fromSavedWorksheet(worksheet));
      setSectionOpen({
        mainBusbar: true,
        neutralEarthBar: false,
        connection: false,
      });
      setPriceMode(worksheet?.pricing?.priceSource === 'Manual' ? 'manual' : 'default');
      setManualPricePerKg(worksheet?.pricing?.priceSource === 'Manual' ? worksheet?.pricing?.appliedPricePerKg ?? 0 : 0);
    }
  }, [open, worksheet]);

  const result = useMemo(() => computeWorksheet(state), [state]);

  const updateMainRow = (index: number, key: keyof MainRow, value: number) => {
    setState((current) => ({
      ...current,
      mainBusbar: current.mainBusbar.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const updateNeutralRow = (index: number, key: keyof NeutralRow, value: number) => {
    setState((current) => ({
      ...current,
      neutralEarthBar: current.neutralEarthBar.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const updateConnectionRow = (index: number, key: keyof ConnectionRow, value: number) => {
    setState((current) => ({
      ...current,
      connection: current.connection.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const handleReset = () => {
    setState(fromSavedWorksheet(worksheet));
    setSectionOpen({
      mainBusbar: true,
      neutralEarthBar: false,
      connection: false,
    });
    setPriceMode(worksheet?.pricing?.priceSource === 'Manual' ? 'manual' : 'default');
    setManualPricePerKg(worksheet?.pricing?.priceSource === 'Manual' ? worksheet?.pricing?.appliedPricePerKg ?? 0 : 0);
  };

  const resolvedDefaultPricePerKg = useMemo(
    () => worksheet?.pricing?.defaultPricePerKg ?? defaultPricePerKg ?? 0,
    [defaultPricePerKg, worksheet?.pricing?.defaultPricePerKg]
  );

  const selectedPricePerKg = priceMode === 'default'
    ? resolvedDefaultPricePerKg
    : Math.max(0, manualPricePerKg || 0);

  const previewTotalCost = round2(result.grandTotalKg * selectedPricePerKg);

  const canSaveWithPricing =
    (priceMode === 'default' && resolvedDefaultPricePerKg >= 0) ||
    (priceMode === 'manual' && Number.isFinite(manualPricePerKg) && manualPricePerKg >= 0);

  const toggleSection = (section: keyof typeof sectionOpen) => {
    setSectionOpen((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const handleSave = async () => {
    try {
      const input = toCompactWorksheetInput(state);
      await calculateMutation.mutateAsync(input);
      await saveMutation.mutateAsync({
        panelId,
        input,
        useDefaultPrice: priceMode === 'default',
        manualPricePerKg: priceMode === 'manual' ? Math.max(0, manualPricePerKg || 0) : undefined,
      });
      onClose();
    } catch {
      // Mutation hooks already show toast errors.
    }
  };

  const isSaving = calculateMutation.isPending || saveMutation.isPending;

  const renderMainTable = () => (
    <Paper sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <SectionHeader
        label="Main Busbar"
        color={sectionAccents.main}
        totalKg={result.mainBusbarTotalKg}
        open={sectionOpen.mainBusbar}
        onToggle={() => toggleSection('mainBusbar')}
      />
      <Collapse in={sectionOpen.mainBusbar} timeout={180} unmountOnExit>
        <TableContainer>
          <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.03) }}>
              <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}># Bars</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}># Poles</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>V/R (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Horz. (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total (Kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.mainBusbar.map((row, index) => (
              <TableRow key={row.size} sx={{ '&:nth-of-type(even)': { backgroundColor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.015) } }}>
                <TableCell sx={{ fontFamily: 'Roboto Mono', fontWeight: 600 }}>{row.size}</TableCell>
                <TableCell align="center">
                  <EditableCell value={state.mainBusbar[index].bars} onChange={(value) => updateMainRow(index, 'bars', value)} accent={sectionAccents.main} integer step={1} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.mainBusbar[index].poles} onChange={(value) => updateMainRow(index, 'poles', value)} accent={sectionAccents.main} integer step={1} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.mainBusbar[index].vrMeters} onChange={(value) => updateMainRow(index, 'vrMeters', value)} accent={sectionAccents.main} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.mainBusbar[index].horizontalMeters} onChange={(value) => updateMainRow(index, 'horizontalMeters', value)} accent={sectionAccents.main} />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ px: 1.5, py: 0.75, borderRadius: 1, backgroundColor: alpha(sectionAccents.main, 0.08) }}>
                    <ReadOnlyCell value={row.totalMeters} strong />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'Roboto Mono', color: 'primary.main' }}>
                    {formatKg(row.totalKg)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );

  const renderNeutralTable = () => (
    <Paper sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <SectionHeader
        label="Neutral + Earth Bar"
        color={sectionAccents.neutral}
        totalKg={result.neutralEarthTotalKg}
        open={sectionOpen.neutralEarthBar}
        onToggle={() => toggleSection('neutralEarthBar')}
      />
      <Collapse in={sectionOpen.neutralEarthBar} timeout={180} unmountOnExit>
        <TableContainer>
          <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.03) }}>
              <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}># Bars</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>N (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>E (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total (Kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.neutralEarthBar.map((row, index) => (
              <TableRow key={row.size} sx={{ '&:nth-of-type(even)': { backgroundColor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.015) } }}>
                <TableCell sx={{ fontFamily: 'Roboto Mono', fontWeight: 600 }}>{row.size}</TableCell>
                <TableCell align="center">
                  <EditableCell value={state.neutralEarthBar[index].bars} onChange={(value) => updateNeutralRow(index, 'bars', value)} accent={sectionAccents.neutral} integer step={1} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.neutralEarthBar[index].neutralMeters} onChange={(value) => updateNeutralRow(index, 'neutralMeters', value)} accent={sectionAccents.neutral} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.neutralEarthBar[index].earthMeters} onChange={(value) => updateNeutralRow(index, 'earthMeters', value)} accent={sectionAccents.neutral} />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ px: 1.5, py: 0.75, borderRadius: 1, backgroundColor: alpha(sectionAccents.neutral, 0.08) }}>
                    <ReadOnlyCell value={row.totalMeters} strong />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'Roboto Mono', color: 'primary.main' }}>
                    {formatKg(row.totalKg)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );

  const renderConnectionTable = () => (
    <Paper sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <SectionHeader
        label="Connection"
        color={sectionAccents.connection}
        totalKg={result.connectionTotalKg}
        open={sectionOpen.connection}
        onToggle={() => toggleSection('connection')}
      />
      <Collapse in={sectionOpen.connection} timeout={180} unmountOnExit>
        <TableContainer>
          <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.03) }}>
              <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}># Bars</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}># Poles</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Cust. (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>BB (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total (mt)</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total (Kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.connection.map((row, index) => (
              <TableRow key={row.size} sx={{ '&:nth-of-type(even)': { backgroundColor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.015) } }}>
                <TableCell sx={{ fontFamily: 'Roboto Mono', fontWeight: 600 }}>{row.size}</TableCell>
                <TableCell align="center">
                  <EditableCell value={state.connection[index].bars} onChange={(value) => updateConnectionRow(index, 'bars', value)} accent={sectionAccents.connection} integer step={1} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.connection[index].poles} onChange={(value) => updateConnectionRow(index, 'poles', value)} accent={sectionAccents.connection} integer step={1} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.connection[index].customMeters} onChange={(value) => updateConnectionRow(index, 'customMeters', value)} accent={sectionAccents.connection} />
                </TableCell>
                <TableCell align="center">
                  <EditableCell value={state.connection[index].bbMeters} onChange={(value) => updateConnectionRow(index, 'bbMeters', value)} accent={sectionAccents.connection} />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ px: 1.5, py: 0.75, borderRadius: 1, backgroundColor: alpha(sectionAccents.connection, 0.08) }}>
                    <ReadOnlyCell value={row.totalMeters} strong />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'Roboto Mono', color: 'primary.main' }}>
                    {formatKg(row.totalKg)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      keepMounted
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          height: '92vh',
          overflow: 'hidden',
          borderRadius: 3,
          background:
            `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.light, 0.06)} 100%)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          overflow: 'hidden',
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.primary.dark} 55%, ${theme.palette.secondary.main} 100%)`,
          color: 'common.white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: 2.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Fill the worksheet, recalculate totals, then store it as one Panel Item.
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={isSaving} sx={{ color: 'common.white', mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <Chip label={`Grand Total: ${formatKg(result.grandTotalKg)} kg`} color="secondary" sx={{ fontWeight: 700 }} />
          <Chip label={`Main Busbar: ${formatKg(result.mainBusbarTotalKg)} kg`} variant="outlined" />
          <Chip label={`Neutral + Earth: ${formatKg(result.neutralEarthTotalKg)} kg`} variant="outlined" />
          <Chip label={`Connection: ${formatKg(result.connectionTotalKg)} kg`} variant="outlined" />
        </Stack>

        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <FormControl>
            <FormLabel sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>Pricing Source</FormLabel>
            <RadioGroup
              row
              value={priceMode}
              onChange={(event) => setPriceMode(event.target.value as 'default' | 'manual')}
            >
              <FormControlLabel value="default" control={<Radio />} label={`Use default price / kg (${formatMoney(resolvedDefaultPricePerKg, currency)})`} />
              <FormControlLabel value="manual" control={<Radio />} label="Enter manual price / kg" />
            </RadioGroup>
          </FormControl>

          {priceMode === 'manual' && (
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Manual Price / KG"
                type="number"
                size="small"
                value={manualPricePerKg}
                onChange={(event) => setManualPricePerKg(Math.max(0, toNumber(event.target.value)))}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ width: { xs: '100%', sm: 240 } }}
              />
            </Box>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <Chip label={`Selected Price/KG: ${formatMoney(selectedPricePerKg, currency)}`} variant="outlined" />
            <Chip label={`Preview Total Cost: ${formatMoney(previewTotalCost, currency)}`} color="primary" />
          </Stack>
        </Paper>

        <Alert severity="info" sx={{ mb: 2 }}>
          The worksheet is saved as a single Busbar & Cables panel item. Zero values are allowed and the backend stores Input, Result, and Pricing in item notes.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {renderMainTable()}
          {renderNeutralTable()}
          {renderConnectionTable()}
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={isSaving}
        >
          Reset
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={async () => {
              try {
                await calculateMutation.mutateAsync(toCompactWorksheetInput(state));
              } catch {
                // Mutation hook already handles toast error.
              }
            }}
            disabled={calculateMutation.isPending || isSaving}
          >
            Recalculate
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving || panelId <= 0 || !canSaveWithPricing}
          >
            {isSaving ? 'Saving...' : 'Save Worksheet'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BusbarCablesWorksheetModal;
