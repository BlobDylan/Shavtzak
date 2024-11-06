import { Box, Typography, Stack, Button } from "@mui/material";
import Platoon from "./platoon-component/Platoon";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../contexts/Company.ctx";
import { useEffect } from "react";
import { resetCompanyData, saveCompanyData } from "../../contexts/helpers";

function LeftPaneContainer() {
  const companyContext = useCompanyContext() as CompanyContextType;

  useEffect(() => {
    companyContext.fetchCompanyData();
  }, []);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      sx={{ padding: "1rem" }}
      width="100%"
    >``
      <Button sx={{ backgroundColor: "primary.main" }} onClick={() => resetCompanyData()}>Reset Data</Button>
      <Button sx={{ backgroundColor: "primary.main" }} onClick={() => saveCompanyData(companyContext.company)}>Save Data</Button>
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
    </Box>
  );
}

export default LeftPaneContainer;
