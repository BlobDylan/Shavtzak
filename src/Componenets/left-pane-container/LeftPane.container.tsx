import { Box, Typography, Stack, Button } from "@mui/material";
import Platoon from "./platoon-component/Platoon";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../contexts/Company.ctx";
import { resetCompanyData, saveCompanyData } from "../../contexts/helpers";

function LeftPaneContainer() {
  const companyContext = useCompanyContext() as CompanyContextType;

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      width="90vw"
    >
      ``
      <Stack
        spacing={1}
        display={"flex"}
        alignItems={"center"}
        sx={{ width: "100%" }}
      >
        <Typography variant="h4">Pluga B</Typography>
        <Platoon platoonNum={1} />
        <Platoon platoonNum={2} />
        <Platoon platoonNum={3} />
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        margin={2}
        width="100%"
        justifyContent={"space-between"}
      >
        <Button
          sx={{ backgroundColor: "primary.main", marginTop: "1rem" }}
          onClick={() => resetCompanyData()}
        >
          Reset Data
        </Button>
        <Button
          sx={{ backgroundColor: "primary.main", marginTop: "1rem" }}
          onClick={() => saveCompanyData(companyContext.company)}
        >
          Save Data
        </Button>
      </Stack>
    </Box>
  );
}

export default LeftPaneContainer;
