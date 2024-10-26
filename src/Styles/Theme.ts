import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#000000", 
    },
    text: {
      primary: "#ffffff", 
      secondary: "#ffffff", 
    },
    background: {
      default: "#d3d3d3", 
      paper: "#1e1e1e", 
    },
    action: {
      active: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#ffffff", 
        },
      },
    },
  },
});

export default theme;