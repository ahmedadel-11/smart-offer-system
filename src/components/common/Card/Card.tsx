import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  CardActionArea,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  loading?: boolean;
  className?: string;
  sx?: Record<string, unknown>;
  variant?: 'elevation' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  actions,
  onClick,
  hoverable = false,
  loading = false,
  className,
  sx: sxProp,
  variant,
}) => {
  const cardContent = (
    <>
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={
            loading ? (
              <Skeleton width="60%" />
            ) : (
              title && <Typography variant="h6">{title}</Typography>
            )
          }
          subheader={
            loading ? (
              <Skeleton width="40%" />
            ) : (
              subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )
            )
          }
          action={headerAction}
          sx={{ pb: 0 }}
        />
      )}
      <CardContent>
        {loading ? (
          <Box>
            <Skeleton />
            <Skeleton />
            <Skeleton width="60%" />
          </Box>
        ) : (
          children
        )}
      </CardContent>
      {actions && <CardActions sx={{ pt: 0 }}>{actions}</CardActions>}
    </>
  );

  return (
    <MuiCard
      className={className}
      variant={variant === 'elevated' ? 'elevation' : variant === 'outlined' ? 'outlined' : undefined}
      elevation={variant === 'elevated' ? 4 : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: hoverable ? 'box-shadow 0.2s, transform 0.2s' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        '&:hover': hoverable
          ? {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            }
          : undefined,
        ...sxProp,
      }}
    >
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </MuiCard>
  );
};

export default Card;
