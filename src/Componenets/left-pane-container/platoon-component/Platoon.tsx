import { useState } from "react";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import SoldierViewComponent from "../soldier-component/Soldier.component";
import { Soldier } from "../../shared/Soldier.model";
import {
  CompanyContextType,
  useCompanyContext,
} from "../../../contexts/Company.ctx";

function Platoon({ platoonNum }: { platoonNum: number }) {
  const companyContext = useCompanyContext() as CompanyContextType;

  return (
    <>
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
          <div style={{ alignSelf: "center" }}>{`Platoon ${platoonNum}`}</div>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: "6px 60px 6px 20px" }}>
          <Stack spacing={1} sx={{ width: "100%" }}>
            {companyContext.company.soldiers
              .filter((s) => s.platoon === platoonNum)
              .map((soldier: Soldier) => (
                <div key={soldier.name}>
                  <SoldierViewComponent soldier={soldier} />
                </div>
              ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default Platoon;
