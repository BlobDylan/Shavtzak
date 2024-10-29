import { SoldierRole } from "../Componenets/shared/SoldierRole.enum";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";
import { TaskType } from "../Componenets/shared/TaskType.enum";

export const predefinedTasks: Task[] = [
  new Task(TaskType.PATROL, [
    SoldierRole.COMBAT,
    SoldierRole.COMBAT,
    SoldierRole.COMMANDER,
    SoldierRole.DRIVER,
  ]),
];

// insure tasks exist for yesterday untill next week today. only if they dont already exist
export const generateMissingTaskInstances = (
  existingTaskInstances: TaskInstance[],
  dates: Date[]
) => {
  let taskInstances = [...existingTaskInstances];
  for (let date of dates) {
    let taskInstancesForDate = taskInstances.filter(
      (taskInstance) => taskInstance.startTime.getDate() === date.getDate()
    );
    if (taskInstancesForDate.length === 0) {
      for (let task of predefinedTasks) {
        taskInstances.push(new TaskInstance(task, date, 2, []));
      }
    }
  }

  return taskInstances;
};
