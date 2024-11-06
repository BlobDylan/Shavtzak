import { Box, Button, Pagination, Stack, Typography } from "@mui/material";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../../contexts/Company.ctx";
import { useEffect, useState } from "react";
import { MissionDay } from "../../shared/MissionDay.model";
import { TaskInstance } from "../../shared/Task.model";
import { Task } from "../../task-components/Task";
import "./tasks.container.scss";
import ExceptionsComponent from "./exceptions-component/exceptions.component";

function TasksContainer() {
  const [currentMissionDay, setMissionDay] = useState<MissionDay | null>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const companyContext = useCompanyContext() as CompanyContextType;
  const [currentMissionDayTaskInstances, setCurrentMissionDayTaskInstances] =
    useState<TaskInstance[]>([]);
  const [shouldShowExceptions, setShouldShowExceptions] = useState<boolean>(false);


  useEffect(() => {
    const today = new Date();
    const currentMissingDayResult = companyContext.company.missionDays.filter(
      (missionDay) => {
        return missionDay.startOfDay.getDay() == today.getDay();
      }
    )[0];
    setMissionDay(currentMissingDayResult);
    setCurrentPage(
      companyContext.company.missionDays.indexOf(currentMissingDayResult) + 1
    );
  }, [companyContext.company]);

  useEffect(() => {
    if (currentMissionDay) {
      setCurrentMissionDayTaskInstances(
        companyContext.company.getRelevantTaskInstances(currentMissionDay)
      );
    }
  }, [currentMissionDay]);

  const onClickedGenerateDefaultTasks = () => {
    if (currentMissionDay) {
      companyContext.generateDefaultTasks(currentMissionDay);
      setCurrentMissionDayTaskInstances(
        companyContext.company.getRelevantTaskInstances(currentMissionDay)
      );
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setMissionDay(companyContext.company.missionDays[value - 1]);
    setCurrentPage(value);
  };

  if (currentMissionDay === null) return <div>error</div>;
  else if (currentMissionDay) return (
    <div>
      <Box
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
      >
        <Typography variant="h4">Tasks</Typography>
        <Typography variant="h6">
          {currentMissionDay.startOfDay.toDateString()}
        </Typography>
        <div className="shared-tasks">
          <div className="select-exceptions-button">
            <Button sx={{ backgroundColor: "primary.main" }} onClick={() => {setShouldShowExceptions(!shouldShowExceptions)}}>Toggle exceptions select</Button>
          </div>
        </div>
        { shouldShowExceptions && <ExceptionsComponent missionDay={currentMissionDay}></ExceptionsComponent> }
        { !shouldShowExceptions &&
              <div>
                {currentMissionDayTaskInstances.length == 0 && (
                  <div>
                    <div className="no-tasks-title">
                      No tasks exists on this mission day
                    </div>
                    <div className="generate-default-tasks-button">
                      <Button
                        onClick={onClickedGenerateDefaultTasks}
                        sx={{ backgroundColor: "primary.main" }}
                      >
                        Generate default tasks
                      </Button>
                    </div>
                  </div>
                )}
                {currentMissionDayTaskInstances.map((taskInstance, index) => (
                  <Task key={index} taskInstance={taskInstance} />
                ))}
              </div>
          }
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
        </div>
      );
}

export default TasksContainer;
