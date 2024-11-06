import { Accordion, AccordionSummary, Checkbox, AccordionDetails, DialogTitle, DialogContent, DialogContentText, TextField, FormGroup, FormControlLabel, DialogActions, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { style, Stack, spacing, margin } from "@mui/system";
import { useCompanyContext, CompanyContextType } from "../../../../contexts/Company.ctx";
import { Soldier } from "../../../shared/Soldier.model";
import SoldierExceptionComponent from "./soldier-exception.component";
import { MissionDay } from "../../../shared/MissionDay.model";
import { useEffect, useState } from "react";

function PlatoonExceptionComponent(props: { missionDay: MissionDay, platoonNum: number }) {
    const companyContext = useCompanyContext() as CompanyContextType;
    const [isChecked, setIsChecked] = useState<boolean>(false);

    useEffect(() => {
        setIsChecked(!props.missionDay.excludedSoldiers.some((s) => { return s.platoon === props.platoonNum }));
    }, []);
  
    useEffect(() => {
        setIsChecked(!props.missionDay.excludedSoldiers.some((s) => { return s.platoon === props.platoonNum }));
    }, [props]);
  
    const handleSelectedPlatoon = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const shouldBeExcluded = !checked;
      props.missionDay.setPlatoonExcludedStatus(companyContext.company, props.platoonNum, shouldBeExcluded);
      setIsChecked(checked);
    }

    const handleSelectedSoldier = () => {
        setIsChecked(!props.missionDay.excludedSoldiers.some((s) => { return s.platoon === props.platoonNum }));
    }

    return (
    <div>
        <Accordion sx={{ width: "100%", backgroundColor: "primary.main" }}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3-content"
                id="panel3-header"
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                >
                <Checkbox checked={isChecked} onChange={handleSelectedPlatoon}/>
                <div style={{ alignSelf: "center" }}>{`Platoon ${props.platoonNum}`}</div>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: "6px 60px 6px 20px" }}>
                <Stack spacing={1} sx={{ width: "100%" }}>
                    {companyContext.company.soldiers
                    .filter((s) => s.platoon === props.platoonNum)
                    .map((soldier: Soldier) => (
                        <div key={soldier.name}>
                        <SoldierExceptionComponent handleSelectedSoldier={handleSelectedSoldier} missionDay={props.missionDay} soldier={soldier} />
                        </div>
                    ))}
                </Stack>
                </AccordionDetails>
        </Accordion>
    </div>
    );
}

export default PlatoonExceptionComponent;
