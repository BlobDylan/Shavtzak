import { Soldier } from "./Soldier.model";
import { SoldierRole } from "./SoldierRole.enum";
import { TaskType } from "./TaskType.enum";

export class TaskInstance {
  id: string;
  task: Task;
  startTime: Date;
  duration: number;
  assignedSoldiers: Soldier[];

  constructor(
    task: Task,
    startTime: string | Date,
    duration: number,
    assignedSoldiers: Soldier[]
  ) {
    this.id = `${task.type}-${startTime}`;
    this.task = task;
    if (typeof startTime === "string") {
      this.startTime = new Date(startTime);
    } else {
      this.startTime = startTime;
    }
    this.duration = duration;
    this.assignedSoldiers = assignedSoldiers;
    this.validate();
  }

  getEndDate(): Date {
    const endDate = new Date(this.startTime);
    endDate.setTime(endDate.getTime() + this.duration * 60 * 60 * 1000);
    return endDate;
  }

  validate(): void {
    if (this.duration < 0) {
      throw new Error("Duration cannot be negative");
    }
    if (this.task === null) {
      throw new Error("Task cannot be null");
    }
    if (this.startTime === null) {
      throw new Error("Start time cannot be null");
    }
  }

  assignNewSoldier(soldier: Soldier, roleIndex: number): void {
    const role = this.task.roles[roleIndex];
    if (role === undefined) {
      throw new Error("Role not found");
    }
    if (this.assignedSoldiers.includes(soldier)) {
      throw new Error("Soldier already assigned to task");
    }
    if (!this.task.roles.includes(role) || !soldier.roles.includes(role)) {
      throw new Error("Role not allowed for task");
    }
    this.assignedSoldiers[roleIndex] = soldier;
  }

  removeSoldier(soldier: Soldier): void {
    const index = this.assignedSoldiers.indexOf(soldier);
    if (index === -1) {
      throw new Error("Soldier not assigned to task");
    }
    this.assignedSoldiers.splice(index, 1);
  }

  getOrganicPlatoon(): number {
    if (this.assignedSoldiers.length === 0) {
      return 0;
    }

    return this.assignedSoldiers[0].platoon;
  }
}

export class Task {
  type: TaskType;
  roles: SoldierRole[];
  isRequireOrganicity: boolean;

  constructor(
    type: TaskType,
    roles: SoldierRole[],
    isRequireOrganicity: boolean = false
  ) {
    this.type = type;
    this.isRequireOrganicity = isRequireOrganicity;
    this.roles = roles;
    this.validate();
  }

  validate(): void {
    if (this.type === undefined || this.roles === undefined) {
      return;
    }
    if (this.roles.length === 0) {
      throw new Error("Task must have at least one role");
    }
    if (
      this.roles.findIndex((sr) => {
        return sr === SoldierRole.COMMANDER;
      }) > 0
    ) {
      throw new Error("Commander role must be the first one");
    }
  }
}
