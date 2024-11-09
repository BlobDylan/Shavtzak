import type { FC } from "react";
import {
  Box,
  Button,
  Pagination,
  Stack,
  Typography,
  Grid2 as Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { toReadableHourAndMinutes } from "../../../contexts/helpers";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../../contexts/Company.ctx";
import { useEffect, useState } from "react";
import { MissionDay } from "../../shared/MissionDay.model";
import { TaskInstance } from "../../shared/Task.model";
import { Task } from "../../task-components/Task";
import { Task as TaskModel } from "../../shared/Task.model";
import "./tasks.container.scss";
import ExceptionsComponent from "./exceptions-component/exceptions.component";
import { Soldier } from "../../shared/Soldier.model";

const DisplayTasksSummary: FC<{ missionDay: MissionDay }> = ({
  missionDay,
}) => {
  const companyContext = useCompanyContext() as CompanyContextType;

  const uniqueTasks = companyContext.getUniqueTasks();
  return (
    <>
      {uniqueTasks.map((task: TaskModel, index) => (
        <DisplayTaskSummary task={task} key={index} missionDay={missionDay} />
      ))}
    </>
  );
};

const DisplayTaskSummary: FC<{ task: TaskModel; missionDay: MissionDay }> = ({
  task,
  missionDay,
}) => {
  const companyContext = useCompanyContext() as CompanyContextType;

  const taskinstances =
    companyContext.company.getRelevantTaskInstances(missionDay);

  const platoonColors: { [key: number]: string } = {
    1: "#fdefc0",
    2: "#d9f3d0",
    3: "#e3d0f0",
    4: "primary.main",
  };

  return (
    <TableContainer component={Paper}>
      <Typography align="center" marginTop={1} variant="h5">
        {task.type}
      </Typography>
      <Table sx={{ minWidth: 800 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {task.roles.map((role: any, index) => (
              <TableCell key={index} variant="head" align="center">
                <Typography>{role}</Typography>
              </TableCell>
            ))}
            <TableCell variant="head" align="center" width={"12%"}>
              <Typography>שעות</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {taskinstances.map(
            (taskInstance: TaskInstance, index) =>
              taskInstance.task.type === task.type && (
                <TableRow key={index}>
                  {taskInstance.assignedSoldiers.map(
                    (soldier: Soldier, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          backgroundColor: platoonColors[soldier.platoon],
                          color: "black",
                        }}
                        size="small"
                        align="center"
                      >
                        <Typography>{soldier.name}</Typography>
                      </TableCell>
                    )
                  )}
                  <TableCell
                    sx={{
                      backgroundColor: "text.primary",
                      color: "black",
                    }}
                    size="small"
                    align="right"
                  >
                    <Typography>
                      {` ${toReadableHourAndMinutes(
                        new Date(
                          taskInstance.startTime.getTime() +
                            taskInstance.duration * 60 * 60 * 1000
                        )
                      )} - ${toReadableHourAndMinutes(taskInstance.startTime)}`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function TasksContainer() {
  const [currentMissionDay, setMissionDay] = useState<MissionDay | null>();
  const [mainPlatoonNum, setMainPlatoonNum] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const companyContext = useCompanyContext() as CompanyContextType;
  const [currentMissionDayTaskInstances, setCurrentMissionDayTaskInstances] =
    useState<TaskInstance[]>([]);
  const [shouldShowExceptions, setShouldShowExceptions] =
    useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
  }, [companyContext]);

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

  const onClickedGenerateAssignment = () => {
    if (currentMissionDay) {
      companyContext.generateAssignments(
        currentMissionDay as MissionDay,
        mainPlatoonNum
      );
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
  const handleChangeMainPlatoonChange = (event: SelectChangeEvent) => {
    setMainPlatoonNum(Number(event.target.value));
  };

  if (currentMissionDay === null || currentMissionDay === undefined)
    return <div>error</div>;
  else if (currentMissionDay)
    return (
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        sx={{ padding: "1rem" }}
        width="100%"
      >
        <Typography variant="h4">Tasks</Typography>
        <Typography variant="h6">
          {currentMissionDay.startOfDay.toDateString()}
        </Typography>
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
          {shouldShowExceptions && (
            <ExceptionsComponent
              missionDay={currentMissionDay}
            ></ExceptionsComponent>
          )}
          <Button
            sx={{ backgroundColor: "primary.main" }}
            onClick={() => {
              setShouldShowExceptions(!shouldShowExceptions);
            }}
          >
            Toggle exceptions select
          </Button>
        </Box>
        {!shouldShowExceptions && (
          <>
            <Stack spacing={1}>
              {currentMissionDayTaskInstances.length == 0 && (
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  alignItems={"center"}
                >
                  <Typography>No tasks exists on this mission day</Typography>
                  <Box flexGrow={1}></Box>
                  <Button
                    onClick={onClickedGenerateDefaultTasks}
                    sx={{
                      backgroundColor: "primary.main",
                    }}
                  >
                    Generate default tasks
                  </Button>
                </Box>
              )}
              <Box flexGrow={1}></Box>

              {!(currentMissionDayTaskInstances.length == 0) && (
                <>
                  <Button
                    onClick={onClickedGenerateAssignment}
                    sx={{ backgroundColor: "primary.main" }}
                  >
                    Generate Assignment
                  </Button>
                  <FormControl variant="filled" sx={{ m: 1, width: 150 }}>
                    <InputLabel id="demo-simple-select-standard-label">
                      {"מחלקה עיקרית (סיור)"}
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select"
                      value={mainPlatoonNum.toString()}
                      sx={{ backgroundColor: "primary.main", color: "pink" }}
                      label="מחלקה עיקרית (סיור)"
                      onChange={handleChangeMainPlatoonChange}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Stack>
            <Grid container rowSpacing={1} columns={12} columnSpacing={1}>
              {currentMissionDayTaskInstances.map((taskInstance, index) => (
                <Grid
                  size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                  key={index}
                >
                  <Task taskInstance={taskInstance} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
        <Stack
          spacing={1}
          display={"flex"}
          alignItems={"center"}
          margin={"10px"}
        >
          <Button
            sx={{ backgroundColor: "primary.main", marginTop: "1rem" }}
            onClick={handleClickOpen}
          >
            Display Shavtzak
          </Button>
          <Dialog open={open} keepMounted fullScreen onClose={handleClose}>
            <DialogTitle align="center">{"שבצק פלוגה ב"}</DialogTitle>
            <Button
              onClick={handleClose}
              sx={{ position: "absolute", right: "10px", top: "10px" }}
            >
              <CloseIcon />
            </Button>
            <DialogContent>
              <DisplayTasksSummary missionDay={currentMissionDay} />
            </DialogContent>
            <DialogActions></DialogActions>
          </Dialog>{" "}
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
