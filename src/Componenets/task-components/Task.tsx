import type { FC } from "react";
import { Box, Typography, Stack, Menu, MenuItem, Button } from "@mui/material";
import { TaskInstance } from "../shared/Task.model";
import {
  useCompanyContext,
  CompanyContextType,
} from "../../contexts/Company.ctx";
import { useState } from "react";
import { Soldier } from "../shared/Soldier.model";
import { toReadableHourAndMinutes } from "../../contexts/helpers";

export const Task: FC<{ taskInstance: TaskInstance }> = ({ taskInstance }) => {
  const companyContext = useCompanyContext() as CompanyContextType;
  const platoonColors: { [key: number]: string } = {
    1: "#fdefc0",
    2: "#d9f3d0",
    3: "#e3d0f0",
    4: "primary.main",
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "50px",
        margin: 0,
        backgroundColor: "primary.main",
        borderRadius: "10px",
        boxShadow: 3,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      <Stack direction={"row"} display={"flex"}>
        <Stack direction={"row"} spacing={2} margin={2} marginBottom={3}>
          {taskInstance.task.roles.map((role, index) => {
            const [anchorEl, setAnchorEl] = useState(null);
            const open = Boolean(anchorEl);
            const handleClick = (event: any) => {
              setAnchorEl(event.currentTarget);
            };
            const handleClose = (soldier: Soldier) => {
              setAnchorEl(null);
              companyContext.assignSoldierToTaskInstance(
                soldier,
                index,
                taskInstance
              );
            };

            return (
              <Stack key={index + role}>
                <Button
                  id="demo-positioned-button"
                  aria-controls={open ? "demo-positioned-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  key={index}
                  sx={{
                    width: "150px",
                    height: "25px",
                    border: "3px solid white",
                    blackborderRadius: "5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    backgroundColor:
                      platoonColors[
                        taskInstance.assignedSoldiers[index] === undefined ||
                        taskInstance.assignedSoldiers[index] === null
                          ? 4
                          : taskInstance.assignedSoldiers[index].platoon
                      ] ?? "primary.main",
                  }}
                  onClick={handleClick}
                >
                  {!taskInstance.assignedSoldiers[index] && role}
                  <Typography color={"black"}>
                    {taskInstance.assignedSoldiers[index] &&
                      taskInstance.assignedSoldiers[index].name}
                  </Typography>
                </Button>
                <Menu
                  id="demo-positioned-menu"
                  aria-labelledby="demo-positioned-button"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => {
                    setAnchorEl(null);
                  }}
                >
                  {(
                    companyContext
                      .getSortedSoldiers(taskInstance)
                      .filter((soldier) =>
                        soldier.roles.includes(role)
                      ) as any[]
                  ).map((soldier, index) => (
                    <MenuItem
                      sx={{ width: "100%" }}
                      key={index}
                      onClick={() => handleClose(soldier)}
                    >
                      <Stack direction={"row"} spacing={1}>
                        <Typography width={"100%"}>
                          {Math.round(
                            Math.min(
                              companyContext.timeSinceLastMission(
                                soldier,
                                taskInstance
                              ),
                              100 * 60 * 60 * 1000
                            ) /
                              1000 /
                              60 /
                              60
                          )}
                        </Typography>
                        <Typography width={"100%"}>{soldier.name}</Typography>
                        <Box flexGrow={1}></Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Menu>
              </Stack>
            );
          })}
        </Stack>
        <Typography variant={"body1"} color="white" marginTop={2}>
          <span dir="rtl">
            {`${taskInstance.task.type} ${toReadableHourAndMinutes(
              new Date(
                taskInstance.startTime.getTime() +
                  taskInstance.duration * 60 * 60 * 1000
              )
            )} - ${toReadableHourAndMinutes(taskInstance.startTime)}`}
          </span>
        </Typography>
      </Stack>
    </Box>
  );
};
