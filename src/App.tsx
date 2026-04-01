import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { theme } from './theme';
import { AppRouter } from './router';
import { ErrorBoundary } from './components';
import { AuthProvider } from './contexts/AuthContext';

// Create a query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Toast configuration
const toasterConfig = {
  position: 'top-right' as const,
  toastOptions: {
    duration: 4000,
    style: {
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 500,
    },
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
