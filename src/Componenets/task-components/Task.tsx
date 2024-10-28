import type { FC } from 'react'
import { useState } from 'react'
import { useDrop } from 'react-dnd'
import { Box, Typography, Stack } from '@mui/material'
import { TaskInstance } from '../shared/Task.model'
import { Soldier } from '../shared/Soldier.model'
import { useCompanyContext, CompanyContextType} from '../../contexts/Company.ctx'
import DeleteIcon from '@mui/icons-material/Delete';

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
        backgroundColor: "primary.main",
        borderRadius: "10px",
        boxShadow: 3,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Stack direction={"column"} display={"flex"} alignItems={'center'}>
        <Typography variant={"body1"} color='white' marginTop={2}>{taskInstance.task.type}</Typography>
        <Stack direction={"row"} spacing={2} margin={2} marginBottom={3}>
          {taskInstance.task.roles.map((role, index) => {
            const [isHovered, setIsHovered] = useState(false);
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
          let backgroundColor = 'white'

          if (isOverCurrent){
            backgroundColor = 'darkgreen'
          } else if (isHovered && taskInstance.assignedSoldiers[index]) {
            backgroundColor = 'red'
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
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{cursor: taskInstance.assignedSoldiers[index] ? "pointer" : "default"}}
              >
              {(isHovered && taskInstance.assignedSoldiers[index]) && <DeleteIcon sx={{color:"text.primary"}} onClick={() => companyContext.removeSoldierFromTaskInstance(taskInstance.assignedSoldiers[index], taskInstance)} />}
                {(!isHovered || !taskInstance.assignedSoldiers[index]) && 
                  <Typography 
                    key={index} 
                    variant={"body2"} 
                    color={"white"}
                    >
                      {role}
                  </Typography>
                }
              <Typography color={"white"}>
                {(!isHovered && taskInstance.assignedSoldiers[index]) && taskInstance.assignedSoldiers[index].name }
              </Typography>
            </Stack>
          )})}
        </Stack>
      </Stack>
    </Box>
  )
}
