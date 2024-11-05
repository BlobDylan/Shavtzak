import { MissionDay } from "../Componenets/shared/MissionDay.model";

export const generateMissingMissionDays = (
    existingMissionDays: MissionDay[]
    ): MissionDay[] => {

    let missionDays = [...existingMissionDays]
    for (let i = -1; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        MissionDay.setToStartOfDay(date);
        if (!missionDays.some((existingMissionDay) => { return existingMissionDay.startOfDay.getDate() == date.getDate() })) {
            missionDays.push(new MissionDay(date, [], []));
        }
    }

    return missionDays;
};
