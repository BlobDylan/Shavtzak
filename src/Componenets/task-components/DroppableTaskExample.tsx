import type { CSSProperties, FC, ReactNode } from 'react'
import { useState } from 'react'
import { useDrop } from 'react-dnd'


export const ItemTypes = {
    SOLDIER: 'soldier',
  }
  
function getStyle(backgroundColor: string): CSSProperties {
  return {
    border: '1px solid rgba(0,0,0,0.2)',
    minHeight: '8rem',
    minWidth: '8rem',
    color: 'white',
    backgroundColor,
    padding: '2rem',
    paddingTop: '1rem',
    margin: '1rem',
    textAlign: 'center',
    float: 'left',
    fontSize: '1rem',
  }
}

export interface DustbinProps {
  greedy?: boolean
  children?: ReactNode
}

export interface DustbinState {
  hasDropped: boolean
  hasDroppedOnChild: boolean
}

export const DroppableTaskExampleComponent: FC<DustbinProps> = ({ children }) => {
  const [hasDropped, setHasDropped] = useState(false)
  const [hasDroppedOnChild, setHasDroppedOnChild] = useState(false)

  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: ItemTypes.SOLDIER,
      drop(_item: unknown, monitor) {
        const didDrop = monitor.didDrop()
        if (didDrop) {
          return
        }
        setHasDropped(true)
        setHasDroppedOnChild(didDrop)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [setHasDropped, setHasDroppedOnChild],
  )

  let backgroundColor = 'rgba(0, 0, 0, .5)'

  if (isOverCurrent){
    backgroundColor = 'darkgreen'
  }

  return (
    <div ref={drop} style={getStyle(backgroundColor)}>
      {hasDropped && <span>dropped {hasDroppedOnChild && ' on child'}</span>}
      <div>{children}</div>
    </div>
  )
}
