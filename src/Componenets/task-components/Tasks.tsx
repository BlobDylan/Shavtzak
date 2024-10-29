import { Box, Pagination, Stack, Typography } from "@mui/material";
import { Task } from "./Task";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../contexts/Company.ctx";
import { useState } from "react";

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

  return (
    <Box
      width={"100%"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <Typography variant="h4">Tasks</Typography>
      <Typography variant="h6">{currentDate.toDateString()}</Typography>
      {companyContext.company.taskInstances
        .filter((task_instance) => {
          console.log(
            "task_instance.id for ",
            task_instance.startTime,
            task_instance.id
          );
          return task_instance.startTime.getDate() === currentDate.getDate();
        })
        .map((taskInstance, index) => (
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
