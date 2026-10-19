import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { store } from './store/store.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,       // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Apply stored theme immediately to avoid flash
const storedTheme = localStorage.getItem('gvb_theme') || 'light';
document.documentElement.setAttribute('data-theme', storedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
