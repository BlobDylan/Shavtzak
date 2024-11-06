import { Company } from "./Company.model";
import { Soldier } from "./Soldier.model";


export class MissionDay {
  startOfDay: Date
  excludedSoldiers: Soldier[]

  constructor(dayDate: Date | string, excludedSoldiers: Soldier[]) {
    if (typeof dayDate === "string") {
      dayDate = new Date(dayDate);
    }

    this.startOfDay = MissionDay.setToStartOfDay(dayDate);
    this.excludedSoldiers = excludedSoldiers;
  }

  public static setToStartOfDay(dayDate: Date): Date {
    dayDate.setHours(0, 0, 0, 0);
    return dayDate;
  }

  public setSoldierExcludedStatus(soldier: Soldier, isExcluded: boolean) {
    if (!isExcluded) {
      this.excludedSoldiers = this.excludedSoldiers.filter((s) => { return s.name !== soldier.name });
      return;
    }
    else if (isExcluded) {
      if (!this.excludedSoldiers.some((s) => { return s.name === soldier.name })) {
        this.excludedSoldiers.push(soldier);
      }
      return;
    }
  }

  public setPlatoonExcludedStatus(company: Company, platoonNum: number, isExcluded: boolean) {
    for (let soldier of company.getSoldiersByPlatoon(platoonNum)) {
      if (soldier.platoon === platoonNum) {
        this.setSoldierExcludedStatus(soldier, isExcluded);
      }
    }
  }
}
