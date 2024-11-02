import { Box, Pagination, Stack, Typography } from "@mui/material";
import { Task } from "./Task";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../contexts/Company.ctx";
import { useState, useEffect } from "react";

function Tasks() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const today = new Date();
    today.setDate(today.getDate() + value - 2);
    setCurrentDate(today);
  };

  const companyContext = useCompanyContext() as CompanyContextType;

  const [taskInstances, setTaskInstances] = useState(
    companyContext.company.taskInstances
  );

  useEffect(() => {
    setTaskInstances(
      companyContext.company.taskInstances.filter((task_instance) => {
        return task_instance.startTime.getDate() === currentDate.getDate();
      })
    );
  }, [currentDate, companyContext.company.taskInstances]);

  return (
    <Box
      width={"100%"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <Typography variant="h4">Tasks</Typography>
      <Typography variant="h6">{currentDate.toDateString()}</Typography>
      {taskInstances.map((taskInstance, index) => (
        <Task key={index} taskInstance={taskInstance} />
      ))}
      <Stack spacing={2} display={"flex"} alignItems={"center"}>
        <Pagination
          count={8}
          variant="outlined"
          shape="rounded"
          sx={{ backgroundColor: "primary.main" }}
          onChange={handlePageChange}
        />
      </Stack>
    </Box>
  );
}

export default Tasks;
