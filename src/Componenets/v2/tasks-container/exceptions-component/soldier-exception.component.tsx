import { Checkbox, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Soldier } from "../../../shared/Soldier.model";
import { MissionDay } from "../../../shared/MissionDay.model";
import { useEffect, useState } from "react";

function SoldierExceptionComponent(props: { handleSelectedSoldier: Function, missionDay: MissionDay, soldier: Soldier }) {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  useEffect(() => {
    setIsChecked(!props.missionDay.excludedSoldiers.some((s) => { return s.name === props.soldier.name }));
  }, []);

  useEffect(() => {
    setIsChecked(!props.missionDay.excludedSoldiers.some((s) => { return s.name === props.soldier.name }));
  }, [props]);

  const handleSelectedSoldier = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const shouldBeExcluded = !checked;
    props.missionDay.setSoldierExcludedStatus(props.soldier, shouldBeExcluded);
    props.handleSelectedSoldier();
    setIsChecked(checked);
  }

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
      <Checkbox checked={isChecked} onChange={handleSelectedSoldier}/>
      <Stack
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant="body1">{props.soldier.name}</Typography>
      </Stack>
    </Box>
  );
}

export default SoldierExceptionComponent;
