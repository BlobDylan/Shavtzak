import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import theme from "./Styles/Theme";
import { CompanyProvider } from "./contexts/Company.ctx";
import TasksContainer from "./Componenets/v2/tasks-container/tasks.container";
import LeftPaneContainer from "./Componenets/left-pane-container/LeftPane.container";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SnackbarProvider } from "notistack";
import Navbar from "./Componenets/navbar-components/Navbar";
import { CompanyContextType, useCompanyContext } from "./contexts/Company.ctx";
import { useEffect } from "react";

const MainLayout = () => {
  const companyContext = useCompanyContext() as CompanyContextType;

  useEffect(() => {
    if (companyContext) {
      companyContext.fetchCompanyData();
    }
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/Soldiers" element={<LeftPaneContainer />} />
          <Route path="/" element={<TasksContainer />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <CompanyProvider>
            <BrowserRouter>
              <MainLayout />
            </BrowserRouter>
          </CompanyProvider>
        </ThemeProvider>
      </DndProvider>
    </SnackbarProvider>
  );
}

export default App;
