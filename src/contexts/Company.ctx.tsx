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

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCompanyData(company);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [company]);

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
        missionDay.includedSoldiers,
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
    try {
      setCompany((prevCompany) => {
        try {
          taskInstance.assignNewSoldier(soldier, roleIndex);
        } catch (error) {
          enqueueSnackbar(String(error), { variant: "error" });
        }
        const updatedTaskInstances = prevCompany.taskInstances.map(
          (instance) => {
            if (instance.id === taskInstance.id) {
              return taskInstance;
            }
            return instance;
          }
        );
        const updatedCompany = new Company(
          prevCompany.soldiers,
          updatedTaskInstances,
          company.missionDays
        );
        return updatedCompany;
      });
    } catch (error) {
      enqueueSnackbar(String(error), { variant: "error" });
    }
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

  const generateAssignments = (missionDay: MissionDay): void => {
    try {
      const orderedSoldiers = company.soldiers.sort((soldier) =>
        calculatePriority(
          soldier,
          missionDay,
          company.missionDays[company.missionDays.indexOf(missionDay) - 1]
        )
      );
      let i = 0;
      for (const taskInstance of company.getRelevantTaskInstances(missionDay)) {
        for (const roleIndex in taskInstance.task.roles) {
          if (
            taskInstance.task.roles[roleIndex] === SoldierRole.MEDIC ||
            taskInstance.task.roles[roleIndex] === SoldierRole.DRIVER
          ) {
            continue;
          }
          i++;
          const role = taskInstance.task.roles[roleIndex];
          const availableSoldiers = company.soldiers.filter((soldier) =>
            soldier.roles.includes(role)
          );
          const assignedSoldier = orderedSoldiers[i % availableSoldiers.length];
          if (assignedSoldier) {
            assignSoldierToTaskInstance(
              assignedSoldier,
              Number(roleIndex),
              taskInstance
            );
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(String(error), { variant: "error" });
    }
  };

  const calculatePriority = (
    soldier: Soldier,
    missionDay: MissionDay,
    previosDay: MissionDay
  ): number => {
    let relevantTaskInstances = company.getRelevantTaskInstances(missionDay);
    if (previosDay) {
      relevantTaskInstances = relevantTaskInstances.concat(
        company.getRelevantTaskInstances(previosDay)
      );
    }
    let timeSinceLastAssignment = Number.MAX_VALUE;
    for (const taskInstance of relevantTaskInstances) {
      for (const assignedSoldier of taskInstance.assignedSoldiers) {
        if (assignedSoldier === null) {
          continue;
        }
        if (assignedSoldier.name === soldier.name) {
          timeSinceLastAssignment = Math.min(
            timeSinceLastAssignment,
            new Date().getTime() - taskInstance.startTime.getTime()
          );
        }
      }
    }
    return timeSinceLastAssignment;
  };

  const saveCompanyData = (company: Company) => {
    localStorage.setItem(
      LOCAL_STORAGE_COMPANY_DATA_KEY,
      JSON.stringify(company)
    );
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
