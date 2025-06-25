import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomChakraProvider from './ChakraProvider';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Importa tu componente App principal
import App from './App';

// Configuración del root para React 18
const container = document.getElementById('root');
const root = createRoot(container!);

const muiTheme = createTheme(); // Podés personalizarlo más adelante si querés

root.render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CustomChakraProvider>
        <App />
      </CustomChakraProvider>
    </ThemeProvider>
  </React.StrictMode>
);