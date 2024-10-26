import { SoldierRole } from "../Componenets/shared/SoldierRole.enum";
import { Task, TaskInstance } from "../Componenets/shared/Task.model";
import { TaskType } from "../Componenets/shared/TaskType.enum";

export const predefinedTasks: Task[] = [
    new Task(TaskType.PATROL, [SoldierRole.COMBAT, SoldierRole.COMBAT, SoldierRole.COMMANDER, SoldierRole.DRIVER])
]

// generate task instance for yeterday today and the next 6 days
export const generateMissingTaskInstances = (existingTaskInstances: TaskInstance[]) => {
    let taskInstances = existingTaskInstances;

    for (let i = -1; i <= 6; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        if (taskInstances.find((taskInstance) => taskInstance.startTime.getDate() === date.getDate()) === undefined) {
            taskInstances = taskInstances.concat(predefinedTasks.map((task) => new TaskInstance(task, date, 4, []))); 
        }
    }

    return taskInstances; 
}
