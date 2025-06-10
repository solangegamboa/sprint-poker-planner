
import React, { useState, useCallback, useEffect } from 'react';
import { Task, PokerValue, UserVote } from '../types';
import { SCRUM_POKER_VALUES } from '../constants';
import PokerCard from './PokerCard';
import ActionButton from './ActionButton';

interface VotingSectionProps {
  task: Task | null;
  onVote: (taskId: string, value: PokerValue, userName: string) => void;
  onRevealVotes: (taskId: string) => void;
  onClearVotes: (taskId: string) => void;
  currentUserName: string | null;
  onSetCurrentUserName: (name: string) => void;
}

const VotingSection: React.FC<VotingSectionProps> = ({ 
  task, 
  onVote, 
  onRevealVotes, 
  onClearVotes,
  currentUserName,
  onSetCurrentUserName
}) => {
  const [selectedPokerValue, setSelectedPokerValue] = useState<PokerValue | null>(null);
  const [inputUserName, setInputUserName] = useState('');

  // Reset selected poker value when task changes or votes are cleared/revealed
  useEffect(() => {
    setSelectedPokerValue(null);
  }, [task?.id, task?.revealed, task?.votes.length]);

  const handleVoteClick = useCallback((value: PokerValue) => {
    setSelectedPokerValue(value);
  }, []);
  
  const handleAddVote = () => {
    if (task && selectedPokerValue !== null && currentUserName) {
      onVote(task.id, selectedPokerValue, currentUserName);
      // setSelectedPokerValue(null); // Reset after voting handled by useEffect
    }
  };

  const handleSetUser = () => {
    if (inputUserName.trim()) {
      onSetCurrentUserName(inputUserName.trim());
      setInputUserName('');
    }
  };
  
  const uniqueVotersCount = task ? new Set(task.votes.map(v => v.userName)).size : 0;

  if (!task) {
    return (
      <div className="p-6 bg-white shadow rounded-lg text-center text-neutral-700">
        <p>Select a task from the list to start voting or view its details.</p>
      </div>
    );
  }

  if (!currentUserName) {
    return (
        <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">Set Your Name to Vote</h2>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={inputUserName}
                    onChange={(e) => setInputUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-grow p-2 border border-neutral-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    aria-label="Enter your name to vote"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetUser()}
                />
                <ActionButton onClick={handleSetUser} variant="primary" disabled={!inputUserName.trim()}>
                    Set Name
                </ActionButton>
            </div>
            <p className="text-xs text-neutral-600 mt-2">You need to set your name to participate in voting for task: <span className="font-semibold">{task.identifier}</span>.</p>
        </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-semibold text-neutral-800">Voting on: <span className="text-primary">{task.identifier}</span></h2>
        <p className="text-sm text-neutral-600">Voting as: <span className="font-semibold text-secondary">{currentUserName}</span></p>
      </div>
      
      {!task.revealed && (
        <p className="text-sm text-neutral-700 mb-4">
          {uniqueVotersCount} user{uniqueVotersCount !== 1 ? 's have' : ' has'} voted so far.
          {task.votes.find(v => v.userName === currentUserName) && <span className="text-primary ml-1">(Your vote is cast)</span>}
        </p>
      )}

      {task.revealed ? (
        <div>
          <h3 className="text-lg font-medium text-neutral-800 mt-4 mb-2">Votes:</h3>
          {task.votes.length > 0 ? (
            <ul className="space-y-1 mb-4">
              {task.votes.map((uv, index) => (
                <li key={index} className="px-3 py-1.5 bg-neutral-100 text-neutral-800 rounded-md text-sm flex justify-between">
                  <span>{uv.userName}:</span>
                  <span className="font-semibold">{uv.vote}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-700 mb-4">No votes were cast for this task.</p>
          )}
          <h3 className="text-lg font-medium text-neutral-800 mb-1">Average Score:</h3>
          <p className="text-3xl font-bold text-secondary">
            {task.averageScore !== null ? task.averageScore.toFixed(1) : 'N/A'}
          </p>
           <ActionButton onClick={() => onClearVotes(task.id)} variant="outline" className="mt-6 text-sm w-full">
            Re-vote (Clears all votes for this task)
          </ActionButton>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-neutral-800 mb-3">Cast Your Vote:</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6">
            {SCRUM_POKER_VALUES.map((value) => (
              <PokerCard 
                key={String(value)} 
                value={value} 
                onClick={handleVoteClick}
                isSelected={selectedPokerValue === value}
              />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <ActionButton 
              onClick={handleAddVote} 
              variant="secondary" 
              disabled={selectedPokerValue === null}
              className="flex-1"
            >
              {task.votes.find(v => v.userName === currentUserName) ? 'Update' : 'Add'} Vote ({selectedPokerValue !== null ? selectedPokerValue : '-'})
            </ActionButton>
            <ActionButton 
              onClick={() => onRevealVotes(task.id)} 
              variant="primary"
              disabled={task.votes.length === 0}
              className="flex-1"
            >
              Reveal Votes & Calculate Average
            </ActionButton>
          </div>
            {task.votes.length > 0 && (
                 <ActionButton onClick={() => onClearVotes(task.id)} variant="danger" className="mt-4 w-full text-sm">
                    Clear All Votes for this Task
                </ActionButton>
            )}
        </div>
      )}
    </div>
  );
};

export default VotingSection;