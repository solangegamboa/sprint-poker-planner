
import React from 'react';
import { Task } from '../types';
import ActionButton from './ActionButton';

interface SessionSummaryProps {
  tasks: Task[];
  onExportMarkdown: () => void;
  onStartNewSession: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ tasks, onExportMarkdown, onStartNewSession }) => {
  const allTasksRevealed = tasks.every(task => task.revealed);

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold text-neutral-800 mb-6 text-center">Session Summary</h2>
      
      {tasks.length === 0 ? (
        <p className="text-neutral-700 text-center">No tasks were part of this session.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {tasks.map(task => (
            <div key={task.id} className="p-4 border border-neutral-200 rounded-md bg-neutral-100/50">
              <h3 className="text-lg font-medium text-primary">{task.identifier}</h3>
              {task.revealed ? (
                <>
                  <p className="text-sm text-neutral-700">
                    Average Score: <span className="font-semibold text-secondary">{task.averageScore !== null ? task.averageScore.toFixed(1) : 'N/A'}</span>
                  </p>
                  {task.votes.length > 0 ? (
                    <div>
                      <p className="text-sm text-neutral-700 mt-1">Votes:</p>
                      <ul className="list-disc list-inside ml-1 text-sm text-neutral-600">
                        {task.votes.map((uv, index) => (
                          <li key={index}><span className="font-medium">{uv.userName}</span>: {uv.vote}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                     <p className="text-sm text-neutral-700">Votes: <span className="font-semibold">No votes cast</span></p>
                  )}
                </>
              ) : (
                 <p className="text-sm text-yellow-600 bg-yellow-400/20 px-2 py-1 rounded-md inline-block">
                  {task.votes.length > 0 ? 
                    `${new Set(task.votes.map(v => v.userName)).size} user(s) voted (not revealed)` : 
                    'No votes cast (not revealed)'}
                 </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!allTasksRevealed && tasks.length > 0 && (
        <p className="text-center text-sm text-yellow-700 mb-4 p-2 bg-yellow-100 rounded-md">
          Note: Some tasks have not had their votes revealed. Their averages and individual votes will be N/A or hidden in the export.
        </p>
      )}

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <ActionButton onClick={onExportMarkdown} variant="secondary" className="flex-1" disabled={tasks.length === 0}>
          Export to Markdown
        </ActionButton>
        <ActionButton onClick={onStartNewSession} variant="primary" className="flex-1">
          Start New Poker Session
        </ActionButton>
      </div>
    </div>
  );
};

export default SessionSummary;