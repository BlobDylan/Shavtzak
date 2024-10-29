import { generateMissingTaskInstances } from "../../contexts/ConstData.const";
import { Soldier } from "./Soldier.model";
import { Task, TaskInstance } from "./Task.model";

export class Company {
  soldiers: Soldier[];
  tasks: Task[];
  dates: Date[] = [];
  taskInstances: TaskInstance[];

  constructor(
    soldiers: Soldier[],
    tasks: Task[],
    taskInstances: TaskInstance[]
  ) {
    this.soldiers = soldiers;
    this.tasks = tasks;
    this.dates = this.generateDates();
    this.taskInstances = generateMissingTaskInstances(
      taskInstances,
      this.dates
    );
    // this.taskInstances = taskInstances;
  }
  generateDates(): Date[] {
    let today = new Date();
    let dates = [];
    for (let i = -1; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }
}
