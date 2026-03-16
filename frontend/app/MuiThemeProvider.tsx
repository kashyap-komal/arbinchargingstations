"use client";

import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6c63ff",
    },
    secondary: {
      main: "#06b6d4",
    },
    background: {
      default: "#0d0f1a",
      paper: "#141624",
    },
    text: {
      primary: "#e8eaf6",
      secondary: "#7b82a8",
    },
    success: {
      main: "#22c55e",
    },
    error: {
      main: "#ef4444",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0d0f1a",
          color: "#e8eaf6",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(28, 31, 53, 0.55)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.16)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(108, 99, 255, 0.5)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6c63ff",
            borderWidth: 1,
          },
        },
        input: {
          color: "#e8eaf6",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9aa2c8",
          "&.Mui-focused": {
            color: "#c2beff",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#9aa2c8",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 10,
        },
        containedPrimary: {
          boxShadow: "0 10px 24px rgba(108, 99, 255, 0.3)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 999,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
});

type MuiThemeProviderProps = {
  children: ReactNode;
};

export default function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
