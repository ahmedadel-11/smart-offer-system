import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  createFilterOptions,
} from '@mui/material';
import { Button } from '../../common';
import { CreateProject, UpdateProject, UserDto } from '../../../types';

const customerFilter = createFilterOptions<string>();

// Schema for create mode
const createProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(100),
  customer: z.string().min(1, 'Customer is required').max(100),
  currency: z.string().min(1, 'Currency is required'),
  defaultMargin: z.number().min(0).max(100).optional(),
  numberOfPanels: z.number().min(1, 'At least 1 panel is required'),
  notes: z.string().optional(),
});

// Schema for edit mode (no numberOfPanels, no status)
const updateProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(100),
  customer: z.string().min(1, 'Customer is required').max(100),
  currency: z.string().min(1, 'Currency is required'),
  defaultMargin: z.number().min(0).max(100).optional(),
  createdByUserId: z.string().optional(),
  notes: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;
type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

interface BaseProjectFormProps {
  isLoading?: boolean;
  customers?: string[];
  users?: UserDto[];
  supportedCurrencies?: string[];
  onCancel?: () => void;
}

interface CreateProjectFormProps extends BaseProjectFormProps {
  mode: 'create';
  onSubmit: (data: CreateProject) => void;
  initialData?: Partial<CreateProject>;
  submitLabel?: string;
}

interface EditProjectFormProps extends BaseProjectFormProps {
  mode: 'edit';
  onSubmit: (data: UpdateProject) => void;
  initialData: UpdateProject & { createdByUserId?: string };
  submitLabel?: string;
}

type ProjectFormProps = CreateProjectFormProps | EditProjectFormProps;

export const ProjectForm: React.FC<ProjectFormProps> = (props) => {
  const {
    onSubmit,
    isLoading = false,
    customers = [],
    users = [],
    supportedCurrencies = [],
    onCancel,
    mode,
  } = props;

  const isCreateMode = mode === 'create';
  const submitLabel = props.submitLabel || (isCreateMode ? 'Create Project' : 'Update Project');
  
  const schema = isCreateMode ? createProjectSchema : updateProjectSchema;
  const initialData = props.initialData || {};
  const normalizedCurrencies = React.useMemo(() => {
    const unique = new Set(
      supportedCurrencies
        .map((currency) => currency.trim().toUpperCase())
        .filter(Boolean)
    );
    unique.add('EGP');

    return Array.from(unique).sort();
  }, [supportedCurrencies]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormData | UpdateProjectFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: initialData.projectName || '',
      customer: initialData.customer || '',
      currency: initialData.currency?.toUpperCase() || 'EGP',
      defaultMargin: (initialData as any).defaultMargin ?? 20,
      ...(isCreateMode && { numberOfPanels: (initialData as CreateProject).numberOfPanels || 1 }),
      ...(!isCreateMode && { createdByUserId: (initialData as any).createdByUserId || '' }),
      notes: initialData.notes || '',
    },
  });

  const handleFormSubmit = (data: CreateProjectFormData | UpdateProjectFormData) => {
    const normalizedData = {
      ...data,
      currency: data.currency.toUpperCase(),
    };

    if (isCreateMode) {
      onSubmit(normalizedData as CreateProject);
    } else {
      onSubmit(normalizedData as UpdateProject);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="projectName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Project Name"
                fullWidth
                required
                error={!!errors.projectName}
                helperText={errors.projectName?.message}
                placeholder="e.g., Office Building Main Distribution"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="customer"
            control={control}
            render={({ field }) => (
              <Autocomplete
                freeSolo
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                options={customers}
                value={field.value || ''}
                onChange={(_event, newValue) => {
                  if (typeof newValue === 'string') {
                    field.onChange(newValue);
                  } else {
                    field.onChange(newValue || '');
                  }
                }}
                onInputChange={(_event, newInputValue) => {
                  field.onChange(newInputValue);
                }}
                filterOptions={(options, params) => {
                  const filtered = customerFilter(options, params);
                  const { inputValue } = params;
                  // Suggest creating a new customer if it doesn't exist
                  const isExisting = options.some(
                    (option) => option.toLowerCase() === inputValue.toLowerCase()
                  );
                  if (inputValue !== '' && !isExisting) {
                    filtered.push(inputValue);
                  }
                  return filtered;
                }}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const isNew = !customers.some(
                    (c) => c.toLowerCase() === option.toLowerCase()
                  );
                  return (
                    <li {...props} key={option}>
                      {isNew ? `Add "${option}"` : option}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer"
                    required
                    error={!!errors.customer}
                    helperText={errors.customer?.message || 'Type to search or add a new customer'}
                    placeholder="Search or type a new customer..."
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.currency}>
                <InputLabel>Currency</InputLabel>
                <Select {...field} label="Currency">
                  {normalizedCurrencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.currency?.message || 'Only configured currencies are allowed.'}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="defaultMargin"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                type="number"
                label="Default Margin (%)"
                fullWidth
                value={value ?? 20}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                error={!!(errors as any).defaultMargin}
                helperText={(errors as any).defaultMargin?.message || 'Applied to all panels by default'}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            )}
          />
        </Grid>

        {isCreateMode && (
          <Grid item xs={12} sm={6}>
            <Controller
              name="numberOfPanels"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Number of Panels"
                  fullWidth
                  required
                  value={value}
                  onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                  error={!!(errors as any).numberOfPanels}
                  helperText={(errors as any).numberOfPanels?.message || 'No limit on the number of panels'}
                  inputProps={{ min: 1 }}
                />
              )}
            />
          </Grid>
        )}

        {!isCreateMode && users.length > 0 && (
          <Grid item xs={12} sm={6}>
            <Controller
              name="createdByUserId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={users.filter((u) => u.isActive)}
                  getOptionLabel={(option) =>
                    typeof option === 'string'
                      ? users.find((u) => u.id === option)?.fullName || option
                      : option.fullName
                  }
                  value={users.find((u) => u.id === field.value) || null}
                  onChange={(_event, newValue) => {
                    field.onChange(
                      newValue && typeof newValue !== 'string' ? newValue.id : ''
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.id === (typeof value === 'string' ? value : value.id)
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Box sx={{ fontWeight: 500 }}>{option.fullName}</Box>
                        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {option.email}
                        </Box>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project Owner"
                      placeholder="Search users..."
                      helperText="Reassign project ownership to another user"
                    />
                  )}
                />
              )}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notes"
                fullWidth
                multiline
                rows={3}
                placeholder="Additional notes about this project..."
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" loading={isLoading}>
              {submitLabel}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectForm;
