import { createContext, useContext, useState, useEffect } from "react";
import { Company } from "../Componenets/shared/Company.model";
import { Soldier } from "../Componenets/shared/Soldier.model";
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from "../apis/Consts";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";
import { MissionDay } from "../Componenets/shared/MissionDay.model";
import { generateMissingMissionDays } from "./helpers";
import { predefinedTaskInstances } from "../ConstData.const";

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
  generateDefaultTasks: (
    missionDay: MissionDay
  ) => void;
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
    for (let soldier of storedCompanyData.soldiers ?? []) {
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
      const parsedMissionDay = new MissionDay(missionDay.startOfDay, missionDay.includedSoldiers, missionDay.excludedSoldiers);
      missionDays.push(parsedMissionDay);
    }
    const fullMissionDays = generateMissingMissionDays(missionDays);

    setCompany(new Company(parsedSoldiers, parsedTaskInstances, fullMissionDays));
  };

  const addSoldier = (soldier: Soldier): void => {
    const newSoldiers = [...company.soldiers, soldier];
    setCompany(new Company(newSoldiers, company.taskInstances, company.missionDays));
  };

  const deleteSoldier = (soldier: Soldier): void => {
    const newSoldiers = company.soldiers.filter((s) => s.name !== soldier.name);
    setCompany(new Company(newSoldiers, company.taskInstances, company.missionDays));
  };

  const generateDefaultTasks = (missionDay: MissionDay): void => {
    if (company.getRelevantTaskInstances(missionDay).length > 0) {
      // Skip generation because mission day already was generated with some task instances
      return
    }

    for (const predefinedTaskInstance of predefinedTaskInstances) {
      const startTime = new Date(missionDay.startOfDay);
      startTime.setHours(predefinedTaskInstance.beginningHour);

      const newTaskInstance = new TaskInstance(
        predefinedTaskInstance.task,
        startTime,
        predefinedTaskInstance.duration,
        []
      )
      company.taskInstances.push(newTaskInstance)
    }
  }

  const assignSoldierToTaskInstance = (
    soldier: Soldier,
    roleIndex: number,
    taskInstance: TaskInstance
  ): void => {
    try {
      setCompany((prevCompany) => {
        taskInstance.assignNewSoldier(soldier, roleIndex);
        const updatedTaskInstances = prevCompany.taskInstances.map(
          (instance) => {
            console.log(`Comparing ${instance.id} with ${taskInstance.id}`);
            if (instance.id === taskInstance.id) {
              console.log("match");
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
      alert(error);
    }
  };

  const removeSoldierFromTaskInstance = (
    soldier: Soldier,
    taskInstance: TaskInstance
  ): void => {
    try {
      taskInstance.removeSoldier(soldier);
    } catch (error) {
      alert(error);
    }
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
        generateDefaultTasks
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
