import { useState } from "react";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import SoldierViewComponent from "../soldier-component/Soldier.component";
import { Soldier } from "../../shared/Soldier.model";
import { CompanyContextType, useCompanyContext } from "../../../contexts/Company.ctx";
import { SoldierRole } from "../../shared/SoldierRole.enum";

function Platoon({ platoonNum }: { platoonNum: number }) {
  const companyContext = useCompanyContext() as CompanyContextType;
  const [openAddSoldier, setOpenAddSoldier] = useState(false);

  return (
    <>
      <Accordion sx={{ width: "100%", backgroundColor: "primary.main" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
          sx={{ display: "flex", flexDirection:"row", alignItems: "center", justifyContent: "space-between" }}
        >
          <Checkbox color="primary.main" />
          <div style={{ alignSelf: "center" }}>{`Platoon ${platoonNum}`}</div>
        </AccordionSummary>
        <AccordionDetails sx={{padding: "6px 60px 6px 20px"}}>
          <Stack spacing={1} sx={{ width: "100%" }}>
            {companyContext.company.soldiers.filter((s) => s.platoon === platoonNum).map((soldier : Soldier) => (
                <div key={soldier.name}>
                    <SoldierViewComponent soldier={soldier} />
                </div>
            ))}
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <IconButton onClick={() => setOpenAddSoldier(true)}>
            <AddIcon />
          </IconButton>
        </AccordionActions>
      </Accordion>

      <Dialog
        open={openAddSoldier}
        onClose={() => setOpenAddSoldier(false)}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const checkboxes = event.currentTarget.querySelectorAll('input[type="checkbox"]');
            const roles = parseRolesFromCheckboxes(checkboxes as NodeListOf<HTMLInputElement>);
            try {
              const newSoldier = new Soldier(platoonNum, formJson.name as string, roles);
              companyContext.addSoldier(newSoldier);
              setOpenAddSoldier(false);
            } catch (error) {
              alert(error)
            }
          },
        }}
      >
        <DialogTitle>New Soldier</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <TextField
            autoFocus
            id="name"
            margin="dense"
            name="name"
            label="Name"
            type="name"
            required
            fullWidth
            variant="standard"
          />
        <FormGroup>
            <FormControlLabel control={<Checkbox />} label="Combat" />
            <FormControlLabel control={<Checkbox />} label="Sharpshooter" />
            <FormControlLabel control={<Checkbox />} label="Commander" />
        </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddSoldier(false)}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const parseRolesFromCheckboxes = (checkboxes: NodeListOf<HTMLInputElement>) => {
  const roles: SoldierRole[] = [];

  if (checkboxes[0].checked) {
    roles.push(SoldierRole.COMBAT);
  }
  if (checkboxes[1].checked) {
    roles.push(SoldierRole.SHARPSHOOTER);
  }
  if (checkboxes[2].checked) {
    roles.push(SoldierRole.COMMANDER);
  }

  return roles;
};

export default Platoon;
