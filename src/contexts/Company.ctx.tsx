import { createContext, useContext, useState, useEffect } from "react";
import { Company } from "../Componenets/shared/Company.model";
import { Soldier } from "../Componenets/shared/Soldier.model";
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from "../apis/Consts";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";
import { MissionDay } from "../Componenets/shared/MissionDay.model";
import {
  generateMissingMissionDays,
  toReadableHourAndMinutes,
} from "./helpers";
import {
  predefinedTaskInstances,
  predefinedSoldiers,
} from "../ConstData.const";
import { useSnackbar } from "notistack";
import { TaskType } from "../Componenets/shared/TaskType.enum";

export type CompanyContextType = {
  company: Company;
  addSoldier: (soldier: Soldier) => void;
  deleteSoldier: (soldier: Soldier) => void;
  fetchCompanyData: () => void;
  assignSoldierToTaskInstance: (
    soldier: Soldier,
    roleIndex: number,
    taskInstance: TaskInstance
  ) => void;
  removeSoldierFromTaskInstance: (
    soldier: Soldier,
    taskInstance: TaskInstance
  ) => void;
  generateDefaultTasks: (missionDay: MissionDay) => void;
  generateAssignments: (missionDay: MissionDay) => void;
  getUniqueTasks: () => Task[];
  getSortedSoldiers: (taskInstance: TaskInstance) => Soldier[];
  timeSinceLastMission: (
    soldier: Soldier,
    taskInstance: TaskInstance
  ) => number;
  clearMissionDayTaskInstances: (misisonDay: MissionDay) => void;
  getLastTaskInstance: (
    soldier: Soldier,
    taskInstance: TaskInstance
  ) => TaskInstance | null;
};

const CompanyContext = createContext<CompanyContextType | null>(null);

const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [company, setCompany] = useState<Company>(new Company([], [], []));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCompanyData = (): void => {
    setIsLoading(true);
    const storedCompanyData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_COMPANY_DATA_KEY) || "{}"
    );

    const parsedSoldiers: Soldier[] = [];
    for (let soldier of predefinedSoldiers) {
      soldier = new Soldier(
        soldier.platoon,
        soldier.name,
        soldier.roles,
        soldier.limitedTaskTypes
      );
      parsedSoldiers.push(soldier);
    }

    const parsedTaskInstances: TaskInstance[] = [];
    for (let taskInstance of storedCompanyData.taskInstances ?? []) {
      const taskInstanceTask = new Task(
        taskInstance.task.type,
        taskInstance.task.roles
      );
      const parsedTaskInstance = new TaskInstance(
        taskInstanceTask,
        taskInstance.startTime,
        taskInstance.duration,
        taskInstance.assignedSoldiers
      );
      parsedTaskInstances.push(parsedTaskInstance);
    }

    const missionDays: MissionDay[] = [];
    for (let missionDay of storedCompanyData.missionDays ?? []) {
      const parsedMissionDay = new MissionDay(
        missionDay.startOfDay,
        missionDay.excludedSoldiers
      );
      missionDays.push(parsedMissionDay);
    }
    const fullMissionDays = generateMissingMissionDays(missionDays);

    setCompany(
      new Company(parsedSoldiers, parsedTaskInstances, fullMissionDays)
    );
    setIsLoading(false);
  };

  const addSoldier = (soldier: Soldier): void => {
    const newSoldiers = [...company.soldiers, soldier];
    setCompany(
      new Company(newSoldiers, company.taskInstances, company.missionDays)
    );
  };

  const deleteSoldier = (soldier: Soldier): void => {
    const newSoldiers = company.soldiers.filter((s) => s.name !== soldier.name);
    setCompany(
      new Company(newSoldiers, company.taskInstances, company.missionDays)
    );
  };

  // keep only one of every task type that exists in the company
  const getUniqueTasks = (): Task[] => {
    return company.taskInstances
      .map((taskInstance) => taskInstance.task)
      .filter(
        (value, index, self) =>
          self.findIndex((t) => t.type === value.type) === index
      );
  };

  const clearMissionDayTaskInstances = (missionDay: MissionDay): void => {
    const missionDayTaskInstances =
      company.getRelevantTaskInstances(missionDay);
    company.taskInstances = company.taskInstances.filter((ti) => {
      return !missionDayTaskInstances.includes(ti);
    });
  };

  const generateDefaultTasks = (missionDay: MissionDay): void => {
    if (company.getRelevantTaskInstances(missionDay).length > 0) {
      // Skip generation because mission day already was generated with some task instances
      return;
    }

    for (const predefinedTaskInstance of predefinedTaskInstances) {
      const startTime = new Date(missionDay.startOfDay);
      startTime.setHours(predefinedTaskInstance.beginningHour);

      const newTaskInstance = new TaskInstance(
        predefinedTaskInstance.task,
        startTime,
        predefinedTaskInstance.duration,
        []
      );
      company.taskInstances.push(newTaskInstance);
    }
  };

  const { enqueueSnackbar } = useSnackbar();

  const assignSoldierToTaskInstance = (
    soldier: Soldier,
    roleIndex: number,
    taskInstance: TaskInstance
  ): void => {
    taskInstance.assignNewSoldier(soldier, roleIndex);
  };

  const removeSoldierFromTaskInstance = (
    soldier: Soldier,
    taskInstance: TaskInstance
  ): void => {
    try {
      taskInstance.removeSoldier(soldier);
    } catch (error) {
      enqueueSnackbar(String(error), { variant: "error" });
    }
  };

  const firstSuitableSoldier = (
    taskInstance: TaskInstance,
    roleIndex: number,
    soldiers: Soldier[],
    organicPlatoonNum: number | null
  ) => {
    for (const soldier of soldiers) {
      // Skip soldiers that are unable to perform this task
      if (
        soldier.limitedTaskTypes.length > 0 &&
        !soldier.limitedTaskTypes.includes(taskInstance.task.type)
      ) {
        continue;
      }

      // Enforce organicity if required
      if (
        taskInstance.task.isRequireOrganicity &&
        soldier.platoon !== organicPlatoonNum
      ) {
        continue;
      }

      // Select only soldiers that have the needed roles for this task
      if (soldier.roles.includes(taskInstance.task.roles[roleIndex])) {
        return soldier;
      }
    }

    return null;
  };

  // Calculate the optimal organic platoon num by selecting the platoon with the most soldiers that are not assigned to the task that the has the lowest time since last mission for every soldier.
  // considering all the soldiers must be from the same platoon for this task
  const calculateOptimalOrganicPlatoonNum = (
    taskInstance: TaskInstance,
    sortedSoldiers: Soldier[]
  ) => {
    const bestSquads: Soldier[][] = [];
    for (let platoonNum = 1; platoonNum <= 3; platoonNum++) {
      const bestSquadForCurrentPlatoon = calculateSquadForOrganicPlatoon(
        taskInstance,
        sortedSoldiers,
        platoonNum
      );
      if (bestSquadForCurrentPlatoon) {
        bestSquads.push(bestSquadForCurrentPlatoon);
      }
    }
    if (bestSquads.length === 0) {
      alert(
        `Failed to find organic squad for task: ${taskInstance.task.type}  ${toReadableHourAndMinutes(taskInstance.startTime)}`
      );
      throw new Error(
        "No organic squads are found for this this task. " +
          taskInstance.task.type
      );
    }
    const platoonWithTheLongestTimeSinceLastMission = bestSquads.reduce(
      (prev, current) => {
        return Math.min(
          timeSinceLastMission(current[0], taskInstance),
          timeSinceLastMission(current[1], taskInstance)
        ) >
          Math.min(
            timeSinceLastMission(prev[0], taskInstance),
            timeSinceLastMission(prev[1], taskInstance)
          )
          ? current
          : prev;
      }
    );
    return platoonWithTheLongestTimeSinceLastMission[0].platoon;
  };

  const calculateSquadForOrganicPlatoon = (
    taskInstance: TaskInstance,
    sortedSoldiers: Soldier[],
    organicPlatoonNum: number
  ): Soldier[] | null => {
    const platoonSquad: Soldier[] = [];
    let sortedSoldiersCopy = [...sortedSoldiers];

    for (let i = 0; i < taskInstance.task.roles.length; i++) {
      const selectedSoldier = firstSuitableSoldier(
        taskInstance,
        i,
        sortedSoldiersCopy,
        organicPlatoonNum
      );
      if (selectedSoldier === null) {
        return null;
      } else {
        platoonSquad.push(selectedSoldier);
        sortedSoldiersCopy = sortedSoldiersCopy.filter((soldier) => {
          return soldier.name !== selectedSoldier.name;
        });
      }
    }

    return platoonSquad;
  };

  const getSortedSoldiers = (taskInstance: TaskInstance): Soldier[] => {
    return company.soldiers.sort((s1, s2) => {
      return (
        timeSinceLastMission(s2, taskInstance) -
        timeSinceLastMission(s1, taskInstance)
      );
    });
  };

  const generateAssignmentForTaskInstance = (
    taskInstance: TaskInstance,
    missionDay: MissionDay
  ) => {
    // Sort soldiers by time since last mission (first assign soldiers that have been idle the longest)

    let sortedSoldiers = getSortedSoldiers(taskInstance);

    // Remove excluded soldiers from the list
    sortedSoldiers = sortedSoldiers.filter((soldier) => {
      return !missionDay.excludedSoldiers.some((excludedSoldier) => {
        return excludedSoldier.name === soldier.name;
      });
    });

    let organicPlatoonNum: number | null = null;
    if (taskInstance.task.isRequireOrganicity) {
      organicPlatoonNum = calculateOptimalOrganicPlatoonNum(
        taskInstance,
        sortedSoldiers
      );
    }
    for (let i = 0; i < taskInstance.task.roles.length; i++) {
      // Skip already roles that have already been manually assigned
      if (taskInstance.assignedSoldiers[i]) {
        continue;
      }

      const assignedSoldier = firstSuitableSoldier(
        taskInstance,
        i,
        sortedSoldiers,
        organicPlatoonNum
      );
      if (assignedSoldier) {
        assignSoldierToTaskInstance(assignedSoldier, i, taskInstance);
        sortedSoldiers = sortedSoldiers.filter((soldier) => {
          return soldier.name !== assignedSoldier.name;
        });
      }
    }
  };

  const generateAssignments = (missionDay: MissionDay): void => {
    try {
      const sortedTaskInstances = company
        .getRelevantTaskInstances(missionDay)
        .sort((a, b) => {
          return a.startTime.getTime() - b.startTime.getTime();
        });
      for (const taskInstance of sortedTaskInstances) {
        generateAssignmentForTaskInstance(taskInstance, missionDay);
      }
    } catch (error) {
      enqueueSnackbar(String(error), { variant: "error" });
    }
  };
  const getLastTaskInstance = (
    soldier: Soldier,
    taskInstance: TaskInstance
  ): TaskInstance | null => {
    const sortedTaskInstancesHistory = company.taskInstances
      .filter((ti) => {
        return ti !== taskInstance;
      })
      .filter((ti) => {
        return ti.assignedSoldiers.some((s) => {
          return s?.name === soldier.name;
        });
      })
      // .filter((ti) => {
      //   return ti.startTime.getTime() <= taskInstance.startTime.getTime();
      // })
      .sort((a, b) => {
        return b.getEndDate().getTime() - a.getEndDate().getTime();
      });
    if (sortedTaskInstancesHistory.length > 0) {
      return sortedTaskInstancesHistory[0];
    }

    return null;
  };

  const timeSinceLastMission = (
    soldier: Soldier,
    taskInstance: TaskInstance
  ): number => {
    const lastTaskInstance = getLastTaskInstance(soldier, taskInstance);
    if (lastTaskInstance !== null) {
      return (
        taskInstance.startTime.getTime() -
        lastTaskInstance.getEndDate().getTime()
      );
    }

    return Number.MAX_VALUE;
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        addSoldier,
        deleteSoldier,
        fetchCompanyData,
        assignSoldierToTaskInstance,
        removeSoldierFromTaskInstance,
        generateDefaultTasks,
        generateAssignments,
        getUniqueTasks,
        getSortedSoldiers,
        timeSinceLastMission,
        clearMissionDayTaskInstances,
        getLastTaskInstance,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

const useCompanyContext = () => {
  return useContext(CompanyContext);
};

export { CompanyProvider, useCompanyContext };
