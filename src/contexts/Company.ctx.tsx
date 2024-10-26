import { createContext, useContext, useState } from 'react';
import { Company } from '../Componenets/shared/Company.model';
import { Soldier } from '../Componenets/shared/Soldier.model';
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from '../apis/Consts';
import { Task, TaskInstance } from '../Componenets/shared/Task.model';
import { SoldierRole } from '../Componenets/shared/SoldierRole.enum';

export type CompanyContextType = {
    company: Company;
    addSoldier: (soldier: Soldier) => void;
    deleteSoldier: (soldier: Soldier) => void;
    fetchCompanyData: () => void;
    assignSoldierToTaskInstance: (soldier: Soldier,role:SoldierRole, taskInstance: TaskInstance) => void;
    removeSoldierFromTaskInstance: (soldier: Soldier, taskInstance: TaskInstance) => void;
};

const CompanyContext = createContext<CompanyContextType | null>(null);

const CompanyProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [company, setCompany] = useState<Company>(new Company([], [], []))

    const fetchCompanyData = (): void => {
        const storedCompanyData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMPANY_DATA_KEY) || "{}");
        const parsedSoldiers: Soldier[] = [];
        for (let soldier of storedCompanyData.soldiers??[]) {
            soldier = new Soldier(soldier.platoon, soldier.name, soldier.roles);
            parsedSoldiers.push(soldier);
        }
        const parsedTasks: Task[] = [];
        for (let task of storedCompanyData.tasks??[]) {
            task = new Task(task.name, task.roles);
            parsedTasks.push(task);
        }
        const parsedTaskInstances: TaskInstance[] = [];
        for (let taskInstance of storedCompanyData.taskInstances??[]) {
            const taskInstanceTask = new Task(taskInstance.task.name, taskInstance.task.roles);
            const parsedTaskInstance = new TaskInstance(taskInstanceTask, taskInstance.startTime, taskInstance.duration, taskInstance.assignedSoldiers);
            parsedTaskInstances.push(parsedTaskInstance);
        }
        setCompany(new Company(parsedSoldiers, parsedTasks, parsedTaskInstances));
        company;
    };

    const addSoldier = (soldier: Soldier): void => {
        const newSoldiers = [...company.soldiers, soldier];
        saveCompanyData(new Company(newSoldiers, company.tasks, company.taskInstances));
        fetchCompanyData();
    };

    const deleteSoldier = (soldier: Soldier): void => {
        const newSoldiers = company.soldiers.filter((s) => s.name !== soldier.name);
        saveCompanyData(new Company(newSoldiers, company.tasks, company.taskInstances));
        fetchCompanyData();
    };

    const saveCompanyData = (company: Company) => {
        localStorage.setItem(LOCAL_STORAGE_COMPANY_DATA_KEY, JSON.stringify(company));
    };

    const assignSoldierToTaskInstance = (soldier: Soldier, role:SoldierRole, taskInstance: TaskInstance): void => {
        try {
            taskInstance.assignNewSoldier(soldier, role);
            saveCompanyData(company);
        } catch (error) {
            alert(error);
        }
    };

    // TODO: Implement this function
    const removeSoldierFromTaskInstance = (soldier: Soldier, taskInstance: TaskInstance): void => {
        return;
    };

  return (
    <CompanyContext.Provider value={{ company, addSoldier, deleteSoldier, fetchCompanyData, assignSoldierToTaskInstance, removeSoldierFromTaskInstance}}>
      {children}
    </CompanyContext.Provider>
  );
};

const useCompanyContext = () => {
  return useContext(CompanyContext);
};

export { CompanyProvider, useCompanyContext };
