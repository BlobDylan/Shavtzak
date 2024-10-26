import { generateMissingTaskInstances } from "../../contexts/ConstData.const";
import { Soldier } from "./Soldier.model";
import { Task, TaskInstance } from "./Task.model";

export class Company {
    soldiers: Soldier[];
    tasks: Task[];
    taskInstances: TaskInstance[];

    constructor(soldiers: Soldier[], tasks: Task[], taskInstances: TaskInstance[]){
        this.soldiers = soldiers;
        this.tasks = tasks;
        // this.taskInstances = generateMissingTaskInstances(taskInstances);
        this.taskInstances = taskInstances;
    }
}
