import { SoldierRole } from "./SoldierRole.enum";
import { TaskType } from "./TaskType.enum";

export class Soldier {
  name: string;
  platoon: number;
  roles: SoldierRole[];
  limitedTaskTypes: TaskType[] = [];

  constructor(platoon: number, name: string, roles: SoldierRole[] | null, limitedTaskTypes: TaskType[] | null = null) {
    if (limitedTaskTypes) {
      this.limitedTaskTypes = limitedTaskTypes;
    }
    this.platoon = platoon;
    this.roles = roles || [];
    this.name = name;
    this.validate();
  }

  validate(): void {
    if (this.name === "") {
      throw new Error("Name cannot be empty");
    }
    if (this.roles.length === 0) {
      throw new Error("Soldier must have at least one role");
    }
    if (this.platoon < 1 || this.platoon > 3) {
      throw new Error("Platoon must be between 1 and 3");
    }
  }
}
