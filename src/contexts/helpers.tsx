import { Company } from "../Componenets/shared/Company.model";
import { MissionDay } from "../Componenets/shared/MissionDay.model";
import { LOCAL_STORAGE_COMPANY_DATA_KEY } from "../apis/Consts";

export const generateMissingMissionDays = (
    existingMissionDays: MissionDay[]
    ): MissionDay[] => {

    let missionDays = [...existingMissionDays]
    for (let i = -1; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        MissionDay.setToStartOfDay(date);
        if (!missionDays.some((existingMissionDay) => { return existingMissionDay.startOfDay.getDate() == date.getDate() })) {
            missionDays.push(new MissionDay(date, []));
        }
    }

    return missionDays;
};

export const resetCompanyData = () => {
    localStorage.setItem(
      LOCAL_STORAGE_COMPANY_DATA_KEY,
      JSON.stringify({})
    );
};

export const saveCompanyData = (company: Company) => {
    localStorage.setItem(
        LOCAL_STORAGE_COMPANY_DATA_KEY,
        JSON.stringify(company)
    );
};
