
import React from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void; // Optional delete functionality
}

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedTaskId, onSelectTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded-lg text-center text-neutral-700">
        <p>No tasks added yet. Add a task to start voting.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-neutral-800 mb-3">Tasks</h2>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const uniqueVotersCount = new Set(task.votes.map(v => v.userName)).size;
          return (
            <li
              key={task.id}
              className={`p-3 rounded-md cursor-pointer transition-colors duration-150 ease-in-out flex justify-between items-center group
                          ${selectedTaskId === task.id ? 'bg-primary/10 text-primary ring-1 ring-primary' : 'bg-neutral-100 hover:bg-primary/5'}`}
              onClick={() => onSelectTask(task.id)}
            >
              <div>
                <span className="font-medium">{task.identifier}</span>
                {task.revealed && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${task.averageScore !== null ? 'bg-secondary/20 text-secondary' : 'bg-yellow-400/20 text-yellow-600'}`}>
                    Avg: {task.averageScore !== null ? task.averageScore.toFixed(1) : 'N/A'}
                  </span>
                )}
                 {!task.revealed && uniqueVotersCount > 0 && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-600">
                    {uniqueVotersCount} voter{uniqueVotersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {onDeleteTask && (
                   <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} 
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      title={`Delete task ${task.identifier}`}
                  >
                      Delete
                  </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TaskList;