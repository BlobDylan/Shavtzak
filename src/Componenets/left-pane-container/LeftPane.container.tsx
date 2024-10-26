import { Box, Typography, Stack } from "@mui/material";
import Platoon from "./platoon-component/Platoon"
import { CompanyContextType, useCompanyContext } from "../../contexts/Company.ctx";
import { useEffect } from "react";

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
      width = "100%"
    >
      <Stack spacing={1} sx={{ width: "100%" }}>
        <Typography variant="h3">Pluga B</Typography>
        <Platoon platoonNum={1} />
        <Platoon platoonNum={2} />
        <Platoon platoonNum={3} />
      </Stack>
    </Box>
  );
}

export default LeftPaneContainer;
