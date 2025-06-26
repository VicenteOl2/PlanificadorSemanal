// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // ← Importa BrowserRouter
import CustomChakraProvider from "./ChakraProvider";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./App";

const container = document.getElementById("root")!;
const root = createRoot(container);
const muiTheme = createTheme();

root.render(
  <React.StrictMode>
    <BrowserRouter>                               {/* ← Envuelve AQUÍ */}
      <ThemeProvider theme={muiTheme}>
        <CustomChakraProvider>
          <App />
        </CustomChakraProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);