import { Box, Stack } from "@mui/system";
import { CompanyContextType, useCompanyContext } from "../../../../contexts/Company.ctx";
import { MissionDay } from "../../../shared/MissionDay.model";
import { Typography } from "@mui/material";
import PlatoonExceptionComponent from "./platoon-exception.component";

function ExceptionsComponent(props: {missionDay: MissionDay}) {
    const companyContext = useCompanyContext() as CompanyContextType;

    return (
        <div>
            <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            sx={{ padding: "1rem" }}
            width="100%"
            >
            <Stack
                spacing={1}
                display={"flex"}
                alignItems={"center"}
                sx={{ width: "100%" }}
            >
                <Typography variant="h4">Pluga B</Typography>
                <PlatoonExceptionComponent missionDay={props.missionDay} platoonNum={1} />
                <PlatoonExceptionComponent missionDay={props.missionDay} platoonNum={2} />
                <PlatoonExceptionComponent missionDay={props.missionDay} platoonNum={3} />
            </Stack>
            </Box>
        </div>
    );
}

export default ExceptionsComponent;
