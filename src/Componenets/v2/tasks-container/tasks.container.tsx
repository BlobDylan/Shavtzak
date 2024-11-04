import { Box, Pagination, Stack, Typography } from "@mui/material";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../../contexts/Company.ctx";
import { useEffect, useState } from "react";
import { MissionDay } from "../../shared/MissionDay.model";

function TasksContainer() {
  const [currentMissionDay, setMissionDay] = useState<MissionDay | null>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const companyContext = useCompanyContext() as CompanyContextType;

  useEffect(() => {
    const today = new Date();
    const currentMissingDayResult = companyContext.company.missionDays.filter((missionDay) => {return missionDay.startOfDay.getDay() == today.getDay()})[0];
    setMissionDay(currentMissingDayResult);
    setCurrentPage(companyContext.company.missionDays.indexOf(currentMissingDayResult) + 1);
  }, [companyContext.company])

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setMissionDay(companyContext.company.missionDays[value - 1]);
    setCurrentPage(value);
  };

  if (currentMissionDay === null) return (<div>error</div>);

  else if (currentMissionDay) return (
    <Box
      width={"100%"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <Typography variant="h4">Tasks</Typography>
      <Typography variant="h6">{currentMissionDay.startOfDay.toDateString()}</Typography>
      {companyContext.company.getRelevantTaskInstances(currentMissionDay).map((taskInstance, index) => (
        <div>Task: {index} </div>
      ))}
      <Stack spacing={2} display={"flex"} alignItems={"center"}>
        <Pagination
          count={companyContext.company.missionDays.length}
          variant="outlined"
          shape="rounded"
          sx={{ backgroundColor: "primary.main" }}
          onChange={handlePageChange}
          page={currentPage}
          />
        </Stack>
    </Box>
  );
}

export default TasksContainer;
