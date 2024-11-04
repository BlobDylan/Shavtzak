import { Soldier } from "./Soldier.model";


export class MissionDay {
  startOfDay: Date
  includedSoldiers: Soldier[]
  excludedSoldiers: Soldier[]

  constructor(dayDate: Date | string, includedSoldiers: Soldier[], excludedSoldiers: Soldier[]) {
    if (typeof dayDate === "string") {
      dayDate = new Date(dayDate);
    }

    this.startOfDay = MissionDay.setToStartOfDay(dayDate);
    this.includedSoldiers = includedSoldiers;
    this.excludedSoldiers = excludedSoldiers;
  }

  public static setToStartOfDay(dayDate: Date): Date {
    dayDate.setHours(0, 0, 0, 0);
    return dayDate;
  }
}
