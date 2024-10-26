import { useQuery } from "@tanstack/react-query";
import { Soldier } from "../Componenets/shared/Soldier.model";
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from "./Consts";
import { Company } from "../Componenets/shared/Company.model";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";

const getCompanyQuery = () => useQuery({ queryKey: ['getCompany'], queryFn: async function (): Promise<Company> {
    const storedCompanyData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMPANY_DATA_KEY) || "{}");
    const parsedSoldiers: Soldier[] = [];
    const parsedTasks: Task[] = [];
    const parsedTaskInstances: TaskInstance[] = [];

    for (let soldier of storedCompanyData.soldiers) {
        soldier = new Soldier(soldier.platoon, soldier.name, soldier.roles);
        parsedSoldiers.push(soldier);
    }
    for (let task of storedCompanyData.tasks) {
        task = new Task(task.name, task.roles);
        parsedTasks.push(task);
    }
    for (let taskInstance of storedCompanyData.taskInstances) {
        taskInstance = new Task(taskInstance.name, taskInstance.roles);
        parsedTaskInstances.push(taskInstance);
    }
    const parsedCompanyData = new Company(parsedSoldiers, parsedTasks, parsedTaskInstances);
    return parsedCompanyData;
}});

const setSoldiers = (soldiers: Soldier[]) => {
    localStorage.setItem(LOCAL_STORAGE_COMPANY_DATA_KEY, JSON.stringify(soldiers));
};

export { getCompanyQuery, setSoldiers };
