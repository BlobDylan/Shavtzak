// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   useLocation,
// } from "react-router-dom";

import { Stack } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./Styles/Theme";
import { CompanyProvider } from "./contexts/Company.ctx";
import TasksContainer from "./Componenets/v2/tasks-container/tasks.container";
import LeftPaneContainer from "./Componenets/left-pane-container/LeftPane.container";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <CompanyProvider>
            {/* <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/Soldiers" element={<LeftPaneContainer />} />
              <Route path="/" element={<TasksContainer />} />
            </Routes>
          </div> */}
            <Stack
              direction={"row"}
              width={"100vw"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"space-around"}
            >
              <LeftPaneContainer />
              <TasksContainer />
            </Stack>
          </CompanyProvider>
        </ThemeProvider>
      </DndProvider>
    </SnackbarProvider>
  );
}

export default App;
