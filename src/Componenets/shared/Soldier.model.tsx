import { SoldierRole } from "./SoldierRole.enum";

export class Soldier {
  name: string;
  platoon: number;
  roles: SoldierRole[];

  constructor(platoon: number, name: string, roles: SoldierRole[] | null) {
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
