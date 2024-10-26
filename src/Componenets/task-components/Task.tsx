import type { FC } from 'react'
import { useDrop } from 'react-dnd'
import { Box, Typography, Stack } from '@mui/material'
import { TaskInstance } from '../shared/Task.model'
import { Soldier } from '../shared/Soldier.model'
import { SoldierRole } from '../shared/SoldierRole.enum'
import { useCompanyContext, CompanyContextType} from '../../contexts/Company.ctx'

export interface DustbinState {
  hasDropped: boolean
  hasDroppedOnChild: boolean
}

export const ItemTypes = {
    SOLDIER: 'soldier',
}

export const Task: FC<{ taskInstance: TaskInstance}> = ({ taskInstance }) => {
  const companyContext = useCompanyContext() as CompanyContextType

  return (
    <Box  
      sx={{
        width: "500px",
        height: "100px",
        margin: 2,
        backgroundColor: 'rgba(0, 0, 0, .5)',
        borderRadius: "10px",
        boxShadow: 3,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
        <Typography variant={"body1"}>{taskInstance.task.type}</Typography>
        <Stack direction={"row"} spacing={2} margin={2}>
          {taskInstance.task.roles.map((role, index) => {
            const [{isOverCurrent}, drop] = useDrop(() => ({
              accept: ItemTypes.SOLDIER,
              drop(_item: unknown, monitor) {
                const didDrop = monitor.didDrop()
                const item = monitor.getItem()
                companyContext.assignSoldierToTaskInstance(item as Soldier, role, taskInstance) 
                if (didDrop) {
                  return
                }
              },
              collect: (monitor) => ({
                isOver: monitor.isOver(),
                isOverCurrent: monitor.isOver({ shallow: true }),
              }),
            }),
            [],
          )
          let backgroundColor = 'rgba(0, 0, 0, .5)'

          if (isOverCurrent){
            backgroundColor = 'darkgreen'
          }

          return(
            <Stack 
                width={"100px"}
                height={"50px"}
                border={"3px dashed"} 
                borderColor={backgroundColor}
                borderRadius={"10px"}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                justifyContent={"space-between"}
                ref={drop}
              >
              <Typography 
                key={index} 
                variant={"body2"} 
                >
                  {role}
              </Typography>
              <Typography>
                {taskInstance.assignedSoldiers[index] && taskInstance.assignedSoldiers[index].name }
              </Typography>
            </Stack>
          )})}
        </Stack>
    </Box>
  )
}
