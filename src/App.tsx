import {Stack } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import theme from './Styles/Theme';
import { CompanyProvider } from "./contexts/Company.ctx";
import Tasks from './Componenets/task-components/Tasks'
import LeftPaneContainer from './Componenets/left-pane-container/LeftPane.container'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <CompanyProvider>
          <Stack direction={"row"} width={'100vw'} display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-around'}> 
            <LeftPaneContainer />
            <Tasks />
          </Stack>
        </CompanyProvider>
      </ThemeProvider>
    </DndProvider>
  )
}

export default App
