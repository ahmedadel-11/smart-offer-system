import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { theme } from './theme';
import { AppRouter } from './router';
import { ErrorBoundary } from './components';
import { AuthProvider } from './contexts/AuthContext';
import { CACHE_CONFIG, TOAST_CONFIG } from './constants';

/**
 * React Query Client
 * Created outside component to prevent recreation on every render
 * Configuration uses centralized CACHE_CONFIG constants
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.STALE_TIME_MS,
      gcTime: CACHE_CONFIG.GC_TIME_MS,
      retry: CACHE_CONFIG.RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Toast configuration using centralized constants
 */
const toasterConfig = {
  position: TOAST_CONFIG.POSITION,
  toastOptions: {
    duration: TOAST_CONFIG.DURATION_MS,
    style: TOAST_CONFIG.STYLE,
    success: {
      iconTheme: {
        primary: '#4CAF50',
        secondary: '#FFFFFF',
      },
      style: {
        background: '#E8F5E9',
        color: '#2E7D32',
      },
    },
    error: {
      iconTheme: {
        primary: '#F44336',
        secondary: '#FFFFFF',
      },
      style: {
        background: '#FFEBEE',
        color: '#C62828',
      },
    },
  },
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
          <Toaster {...toasterConfig} />
        </ThemeProvider>
        {/* React Query Devtools - only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
