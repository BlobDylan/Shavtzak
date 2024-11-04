import { MissionDay } from "./MissionDay.model";
import { Soldier } from "./Soldier.model";
import { TaskInstance } from "./Task.model";

export class Company {
  soldiers: Soldier[];
  taskInstances: TaskInstance[];
  missionDays: MissionDay[];

  constructor(
    soldiers: Soldier[],
    taskInstances: TaskInstance[],
    missionDays: MissionDay[]
  ) {
    this.soldiers = soldiers;
    this.taskInstances = taskInstances;
    this.missionDays = missionDays;
  }

  public getRelevantTaskInstances(missionDay: MissionDay): TaskInstance[] {
    return this.taskInstances.filter((taskInstance) => {
      taskInstance.startTime.getFullYear() == missionDay.startOfDay.getFullYear() 
      &&
      taskInstance.startTime.getMonth() == missionDay.startOfDay.getMonth()
      &&
      taskInstance.startTime.getDay() == missionDay.startOfDay.getDay()
    });
  }
}
