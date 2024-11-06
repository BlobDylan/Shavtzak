import { Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            onClick={() => {
              navigate("/");
            }}
          >
            Tasks
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              navigate("/soldiers");
            }}
          >
            Soldiers
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
