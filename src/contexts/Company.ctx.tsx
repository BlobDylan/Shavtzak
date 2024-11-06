import { createContext, useContext, useState, useEffect } from "react";
import { Company } from "../Componenets/shared/Company.model";
import { Soldier } from "../Componenets/shared/Soldier.model";
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from "../apis/Consts";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";
import { SoldierRole } from "../Componenets/shared/SoldierRole.enum";
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
};

const CompanyContext = createContext<CompanyContextType | null>(null);

const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [company, setCompany] = useState<Company>(new Company([], [], []));

  const fetchCompanyData = (): void => {
    const storedCompanyData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_COMPANY_DATA_KEY) || "{}"
    );

    const parsedSoldiers: Soldier[] = [];
    for (let soldier of storedCompanyData.soldiers ?? predefinedSoldiers) {
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
    soldiers: Soldier[]
  ) => {
    for (const soldier of soldiers) {
      if (soldier.roles.includes(taskInstance.task.roles[roleIndex])) {
        return soldier;
      }
    }
    return null;
  };

  const generateAssignmentForTaskInstance = (taskInstance: TaskInstance) => {
    let sortedSoldiers = company.soldiers.sort((s1, s2) => {
      return timeSinceLastMission(s2, taskInstance.startTime) - timeSinceLastMission(s1, taskInstance.startTime);
    });
    debugger;
    for (let i = 0; i < taskInstance.task.roles.length; i++) {
      const assignedSoldier = firstSuitableSoldier(
        taskInstance,
        i,
        sortedSoldiers
      );
      if (assignedSoldier) {
        assignSoldierToTaskInstance(assignedSoldier, i, taskInstance);
        sortedSoldiers = sortedSoldiers.filter(
          (soldier) => { return soldier.name !== assignedSoldier.name }
        );
      }
    }
  };

  const generateAssignments = (missionDay: MissionDay): void => {
    try {
      const sortedTaskInstances = company.getRelevantTaskInstances(missionDay).sort((a, b) => { return a.startTime.getTime() - b.startTime.getTime() });
      for (const taskInstance of sortedTaskInstances) {
        generateAssignmentForTaskInstance(taskInstance);
      }
    } catch (error) {
      enqueueSnackbar(String(error), { variant: "error" });
    }
  };

  const timeSinceLastMission = (
    soldier: Soldier,
    taskInstanceStartTime: Date
  ): number => {
    const sortedTaskInstancesHistory = company.taskInstances
      .filter((taskInstance) => { return taskInstance.assignedSoldiers.some((s) => {return s.name === soldier.name } )})
      .filter((taskInstance) => { return taskInstance.startTime.getTime() <= taskInstanceStartTime.getTime() })
      .sort((a, b) => { return b.startTime.getTime() - a.startTime.getTime() });
    if (sortedTaskInstancesHistory.length > 0) {
      return taskInstanceStartTime.getTime() - sortedTaskInstancesHistory[0].startTime.getTime();
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
