import { useDrag } from "react-dnd";

import { Typography, Box, IconButton, Stack, Checkbox } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { Soldier } from "../../shared/Soldier.model";
import { SoldierRole } from "../../shared/SoldierRole.enum";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../../contexts/Company.ctx";
import { ItemTypes } from "../../task-components/DroppableTaskExample";

function SoldierViewComponent(props: { soldier: Soldier }) {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.SOLDIER,
    item: props.soldier,
  }));
  const companyContext = useCompanyContext() as CompanyContextType;

  return (
    <Box
      ref={drag}
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
      <Checkbox color="primary.main" />
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
      <IconButton>
        <DeleteIcon
          onClick={() => companyContext.deleteSoldier(props.soldier)}
        />
      </IconButton>
    </Box>
  );
}

const prettyPrintRoles = (roles: SoldierRole[]) => {
  return roles.map((role) => role).join(" - ");
};

export default SoldierViewComponent;
