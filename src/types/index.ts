export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    completed: boolean;
}

export interface WeeklyPlan {
    weekStart: Date;
    tasks: Task[];
}