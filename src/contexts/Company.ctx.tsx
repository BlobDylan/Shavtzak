import { createContext, useContext, useState, useEffect } from "react";
import { Company } from "../Componenets/shared/Company.model";
import { Soldier } from "../Componenets/shared/Soldier.model";
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from "../apis/Consts";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";
import { MissionDay } from "../Componenets/shared/MissionDay.model";
import { generateMissingMissionDays } from "./helpers";
import {
  predefinedTaskInstances,
  predefinedSoldiers,
} from "../ConstData.const";
import { useSnackbar } from "notistack";

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
      soldier = new Soldier(soldier.platoon, soldier.name, soldier.roles);
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
    organicPlatoon: number | null,
  ) => {
    for (const soldier of soldiers) {
      // enforce organicity if required
      if (taskInstance.task.isRequireOrganicity && organicPlatoon && soldier.platoon !== organicPlatoon) {
        continue
      }

      if (soldier.roles.includes(taskInstance.task.roles[roleIndex])) {
        return soldier;
      }
    }

    return null;
  };

  const generateAssignmentForTaskInstance = (taskInstance: TaskInstance, missionDay: MissionDay) => {
    // Sort soldiers by time since last mission (first assign soldiers that have been idle the longest)
    let sortedSoldiers = company.soldiers.sort((s1, s2) => {
      return (
        timeSinceLastMission(s2, taskInstance.startTime) -
        timeSinceLastMission(s1, taskInstance.startTime)
      );
    });

    // Remove excluded soldiers from the list
    sortedSoldiers = sortedSoldiers.filter((soldier) => {
      return !missionDay.excludedSoldiers.some((excludedSoldier) => { return excludedSoldier.name === soldier.name });
    });

    for (let i = 0; i < taskInstance.task.roles.length; i++) {
      // Skip already roles that have already been manually assigned
      if (taskInstance.assignedSoldiers[i]) {
        continue;
      }

      const organicPlatoon = taskInstance.getOrganicPlatoon();  // to be used only if the task requires organicity
      const assignedSoldier = firstSuitableSoldier(
        taskInstance,
        i,
        sortedSoldiers,
        organicPlatoon
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
      const sortedTaskInstances = company.getRelevantTaskInstances(missionDay).sort((a, b) => { return a.startTime.getTime() - b.startTime.getTime() });
      for (const taskInstance of sortedTaskInstances) {
        generateAssignmentForTaskInstance(taskInstance, missionDay);
      }
    } catch (error) {
      enqueueSnackbar(String(error), { variant: "error" });
    }
  };

  const timeSinceLastMission = (
    soldier: Soldier,
    taskInstanceStartTime: Date
  ): number => {
    debugger;
    const sortedTaskInstancesHistory = company.taskInstances
      .filter((taskInstance) => { return taskInstance.assignedSoldiers.some((s) => {return s?.name === soldier.name } )})
      .filter((taskInstance) => { return taskInstance.startTime.getTime() <= taskInstanceStartTime.getTime() })
      .sort((a, b) => { return b.startTime.getTime() - a.startTime.getTime() });
    if (sortedTaskInstancesHistory.length > 0) {
      return (
        taskInstanceStartTime.getTime() -
        sortedTaskInstancesHistory[0].startTime.getTime()
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
