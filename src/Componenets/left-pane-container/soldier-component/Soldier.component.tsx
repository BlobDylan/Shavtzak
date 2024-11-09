import { Typography, Box, IconButton, Stack } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { Soldier } from "../../shared/Soldier.model";
import { SoldierRole } from "../../shared/SoldierRole.enum";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../../contexts/Company.ctx";

function SoldierViewComponent(props: { soldier: Soldier }) {
  const companyContext = useCompanyContext() as CompanyContextType;

  return (
    <Box
      width={"100%"}
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        borderRadius: "10px",
        border: "1px solid white",
        padding: "0.5rem",
      }}
    >
      <Box flexGrow={1}></Box>
      <Stack
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant="body1">{props.soldier.name}</Typography>
        <Typography variant="body2">
          {prettyPrintRoles(props.soldier.roles)}
        </Typography>
      </Stack>
      <Box flexGrow={1}></Box>
      <IconButton onClick={() => companyContext.deleteSoldier(props.soldier)}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}

const prettyPrintRoles = (roles: SoldierRole[]) => {
  return roles.map((role) => role).join(" - ");
};

export default SoldierViewComponent;
