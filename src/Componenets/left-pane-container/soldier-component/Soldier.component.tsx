// import {
//     Typography,
//     Box,
//     IconButton,
// } from "@mui/material";

// import DeleteIcon from '@mui/icons-material/Delete';
// import { Soldier } from "../../shared/Soldier.model";
// import { SoldierRole } from "../../shared/SoldierRole.enum";
// import { CompanyContextType, useCompanyContext } from "../../../contexts/Company.ctx";


// function SoldierViewComponent(props:{soldier: Soldier}) {
//     const companyContext = useCompanyContext() as CompanyContextType;

//     return (
//         // make the box display flex horizontally and align items to edges
//         // add a round border to the box with rounded corners in white color
//         <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" sx={{borderRadius: "10px", border: "1px solid white", padding: "0.5rem"}}>
//             <div>
//                 <Typography variant="body1">{props.soldier.name}</Typography>
//                 <Typography variant="body2">{prettyPrintRoles(props.soldier.roles)}</Typography>
//             </div>
//             <IconButton onClick={() => companyContext.deleteSoldier(props.soldier)}>
//                 <DeleteIcon />
//             </IconButton>
//         </Box>
//     );
// }

// const prettyPrintRoles = (roles: SoldierRole[]) => {
//     return roles.map((role) => role).join(" - ");
// }

// export default SoldierViewComponent;

import { useDrag } from 'react-dnd'

import {
    Typography,
    Box,
    IconButton,
} from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';
import { Soldier } from "../../shared/Soldier.model";
import { SoldierRole } from "../../shared/SoldierRole.enum";
import { CompanyContextType, useCompanyContext } from "../../../contexts/Company.ctx";
import { ItemTypes } from '../../task-components/DroppableTaskExample';


const style = {
    display: 'inline-block',
    cursor: 'move',
}

function SoldierViewComponent(props:{soldier: Soldier}) {
    const [, drag] = useDrag(() => ({ type: ItemTypes.SOLDIER, item: props.soldier }))
    const companyContext = useCompanyContext() as CompanyContextType;

    return (
        <div ref={drag} style={style}>
            <Box ref={drag} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" sx={{borderRadius: "10px", border: "1px solid white", padding: "0.5rem"}}>
                <div>
                    <Typography variant="body1">{props.soldier.name}</Typography>
                    <Typography variant="body2">{prettyPrintRoles(props.soldier.roles)}</Typography>
                </div>
                <IconButton onClick={() => companyContext.deleteSoldier(props.soldier)}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        </div>
    );
}

const prettyPrintRoles = (roles: SoldierRole[]) => {
    return roles.map((role) => role).join(" - ");
}

export default SoldierViewComponent;
