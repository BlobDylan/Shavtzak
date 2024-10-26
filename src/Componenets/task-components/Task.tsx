import type { FC } from 'react'
import { useDrop } from 'react-dnd'
import { Box, Typography, Stack } from '@mui/material'
import { useState } from 'react'
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

  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: ItemTypes.SOLDIER,
      drop(_item: unknown, monitor) {
        const didDrop = monitor.didDrop()
        const item = monitor.getItem()
        companyContext.assignSoldierToTaskInstance(item as Soldier, SoldierRole.COMBAT, taskInstance) 
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

  return (
    <Box  
      width={"500px"}
      height={"100px"} 
      border={"3px dashed"} 
      margin={2}
      borderColor={backgroundColor} 
      borderRadius={"10px"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      ref={drop}
    >
        <Typography variant={"h5"}>{taskInstance.task.type}</Typography>
        <Stack direction={"row"} spacing={2}>
          {taskInstance.task.roles.map((role, index) => <Typography key={index} variant={"body2"}>{role}</Typography>)}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          {taskInstance.assignedSoldiers.map((soldier, index) => <Typography key={index} variant={"body2"}>{soldier.name}</Typography>)}
        </Stack>
    </Box>
  )
}
