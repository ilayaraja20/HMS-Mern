import { createTheme } from "@mui/material/styles";

const primary = "#0f766e";
const accent = "#2563eb";
const pageBg = "#edf3f8";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primary,
      dark: "#0b5a54",
      light: "#31a79b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: accent,
      dark: "#1e4eb4",
      light: "#5b84ec",
      contrastText: "#ffffff",
    },
    success: {
      main: "#15803d",
    },
    warning: {
      main: "#b45309",
    },
    error: {
      main: "#b91c1c",
    },
    text: {
      primary: "#112132",
      secondary: "#4a5d72",
    },
    background: {
      default: pageBg,
      paper: "#ffffff",
    },
    divider: "#d4dfeb",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Sora", "Manrope", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Sora", "Manrope", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Sora", "Manrope", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Sora", "Manrope", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Sora", "Manrope", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Sora", "Manrope", sans-serif',
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0.2,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at 12% 8%, rgba(53, 107, 173, 0.12), transparent 42%), radial-gradient(circle at 88% 20%, rgba(15, 118, 110, 0.1), transparent 40%), #edf3f8",
          minHeight: "100vh",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 14,
          minHeight: 38,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fcfdff",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: "#203247",
          backgroundColor: "#f6f9fd",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
