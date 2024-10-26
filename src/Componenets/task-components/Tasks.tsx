import { Box, Pagination, Stack, Typography} from "@mui/material"
import {Task} from "./Task"
import { CompanyContextType, useCompanyContext } from "../../contexts/Company.ctx";
import { useState } from "react";

function Tasks() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDateString, setCurrentDateString] = useState("Today");

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    const today = new Date();
    const adjustedDate = new Date(today);
    adjustedDate.setDate(today.getDate() + value - 2); // Adjust date based on value
    setCurrentDate(adjustedDate);
    if (value === 1) {
      setCurrentDateString("Yesterday");
    } else if (value === 2) {
      setCurrentDateString("Today");
    } else if (value === 3) {
      setCurrentDateString("Tomorrow");
    } else {
      setCurrentDateString(adjustedDate.toString());
    }
  }

  const companyContext = useCompanyContext() as CompanyContextType;
  // For Debugging: remove later
  // console.log(companyContext.company.taskInstances)

  return (
    <Box>
      {/* Add a filter by date */}
      <Typography variant="h4">Tasks</Typography> 
      <Typography variant="h6">{currentDateString}</Typography>
        {companyContext.company.taskInstances.filter((task_instance) => {
          return task_instance.startTime.getDay() === currentDate.getDay();
        }).map((taskInstance, index) => <Task key={index} taskInstance={taskInstance} />)}
      <Stack spacing={2} display={"flex"} alignItems={"center"}>
        <Pagination count={8} variant="outlined" shape="rounded" sx={{ backgroundColor: "primary.main"}} onChange={handlePageChange}/>
      </Stack>
    </Box>
  )
}

export default Tasks
