import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  backButton?: {
    label: string;
    onClick?: () => void;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  backButton,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButton?.onClick) {
      backButton.onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast || !crumb.path ? (
              <Typography key={crumb.label} color="text.primary" variant="body2" noWrap>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.label}
                color="inherit"
                href={crumb.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(crumb.path!);
                }}
                underline="hover"
                variant="body2"
                noWrap
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {backButton && (
            <IconButton onClick={handleBack} sx={{ mr: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' },
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
              '& > *': {
                flex: { xs: '1 1 auto', sm: '0 0 auto' },
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
