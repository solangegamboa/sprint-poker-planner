
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Task, PokerValue, AppPhase, UserVote } from './types';
import Header from './components/Header';
import TaskInputForm from './components/TaskInputForm';
import TaskList from './components/TaskList';
import VotingSection from './components/VotingSection';
import SessionSummary from './components/SessionSummary';
import ActionButton from './components/ActionButton';
import JiraImportModal from './components/JiraImportModal'; // Import the new modal
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [appPhase, setAppPhase] = useState<AppPhase>('WELCOME');
  const [currentUserName, setCurrentUserNameState] = useState<string | null>(null);

  // State for Jira Import Modal
  const [isJiraImportModalOpen, setIsJiraImportModalOpen] = useState(false);
  const [jiraImportLoading, setJiraImportLoading] = useState(false);
  const [jiraImportError, setJiraImportError] = useState<string | null>(null);

  useEffect(() => {
    if (isJiraImportModalOpen) {
      document.body.classList.add('modal-open-overflow-hidden');
    } else {
      document.body.classList.remove('modal-open-overflow-hidden');
    }
    // Cleanup function to remove the class if the component unmounts while modal is open
    return () => {
      document.body.classList.remove('modal-open-overflow-hidden');
    };
  }, [isJiraImportModalOpen]);


  const setCurrentUserName = useCallback((name: string) => {
    if (name.trim()) {
      setCurrentUserNameState(name.trim());
    }
  }, []);

  const handleAddTask = useCallback((identifier: string) => {
    const newTask: Task = {
      id: `${Date.now()}-${identifier}`, // Simple unique ID
      identifier,
      votes: [],
      averageScore: null,
      revealed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const handleBulkAddTasks = useCallback((identifiers: string[]) => {
    const newTasks: Task[] = identifiers.map((identifier, index) => ({
      id: `${Date.now()}-batch-${index}-${identifier}`,
      identifier,
      votes: [],
      averageScore: null,
      revealed: false,
    }));
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
    // Optionally, close Jira modal if open and this was triggered by it (handled in handleFetchAndAddJiraTasks)
  }, []);
  
  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
    }
  }, [selectedTaskId]);


  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const calculateAverage = (votes: UserVote[]): number | null => {
    const numericVotes = votes.map(uv => uv.vote).filter(v => typeof v === 'number') as number[];
    if (numericVotes.length === 0) return null;
    const sum = numericVotes.reduce((acc, v) => acc + v, 0);
    return sum / numericVotes.length;
  };

  const handleVote = useCallback((taskId: string, value: PokerValue, userName: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const existingVoteIndex = task.votes.findIndex(v => v.userName === userName);
          let newVotes: UserVote[];
          if (existingVoteIndex !== -1) {
            newVotes = [...task.votes];
            newVotes[existingVoteIndex] = { userName, vote: value };
          } else {
            newVotes = [...task.votes, { userName, vote: value }];
          }
          return { ...task, votes: newVotes };
        }
        return task;
      })
    );
  }, []);

  const handleRevealVotes = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            revealed: true,
            averageScore: calculateAverage(task.votes),
          };
        }
        return task;
      })
    );
  }, []);
  
  const handleClearVotes = useCallback((taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, votes: [], averageScore: null, revealed: false } : task
      )
    );
  }, []);


  const handleExportMarkdown = useCallback(() => {
    let markdownContent = `# ${APP_TITLE} - Session Summary\n\n`;
    tasks.forEach(task => {
      markdownContent += `## Task: ${task.identifier}\n`;
      if (task.revealed) {
        markdownContent += `- Average Score: ${task.averageScore !== null ? task.averageScore.toFixed(1) : 'N/A'}\n`;
        if (task.votes.length > 0) {
          markdownContent += `- Votes:\n`;
          task.votes.forEach(uv => {
            markdownContent += `  - ${uv.userName}: ${uv.vote}\n`;
          });
        } else {
          markdownContent += `- Votes: No votes cast\n`;
        }
      } else {
        markdownContent += `- Votes: ${task.votes.length > 0 ? `${new Set(task.votes.map(v => v.userName)).size} user(s) voted (not revealed)` : 'No votes cast (not revealed)'}\n\n`;
      }
      markdownContent += `\n`;
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprint-poker-summary.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tasks]);

  const handleStartNewSession = useCallback(() => {
    setTasks([]);
    setSelectedTaskId(null);
    setAppPhase('SESSION_ACTIVE');
  }, []);

  const selectedTask = useMemo(() => {
    return tasks.find(task => task.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const handleFetchAndAddJiraTasks = async (
    jiraInstanceUrl: string,
    email: string,
    apiToken: string,
    jqlQuery: string
  ) => {
    setJiraImportLoading(true);
    setJiraImportError(null);
    try {
      const encodedCredentials = btoa(`${email}:${apiToken}`);
      const headers = new Headers();
      headers.append('Authorization', `Basic ${encodedCredentials}`);
      headers.append('Accept', 'application/json');

      // Ensure the Jira instance URL doesn't end with a slash for clean concatenation
      const baseUrl = jiraInstanceUrl.endsWith('/') ? jiraInstanceUrl.slice(0, -1) : jiraInstanceUrl;
      const apiUrl = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jqlQuery)}&fields=key`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.errorMessages && errorData.errorMessages.length > 0) {
                errorMessage = errorData.errorMessages.join(' ');
            } else if (errorData && errorData.message) {
                 errorMessage = errorData.message;
            }
        } catch (e) {
            // Failed to parse error JSON, stick with status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const issueKeys = data.issues?.map((issue: { key: string }) => issue.key) || [];

      if (issueKeys.length === 0) {
        setJiraImportError("No issues found for the given JQL query, or you may lack permissions to view them.");
        // Keep modal open to show the error
        return; 
      }

      handleBulkAddTasks(issueKeys);
      setIsJiraImportModalOpen(false); // Close modal on success
    } catch (error: any) {
      console.error("Jira Import Error:", error);
      let detailedErrorMessage = 'Failed to fetch tasks from Jira.';
      if (error && typeof error.message === 'string' && error.message.trim() !== '') {
          detailedErrorMessage = error.message;
      }
      
      if (detailedErrorMessage.toLowerCase().includes('failed to fetch')) {
          detailedErrorMessage += ' This commonly indicates a network issue or a CORS (Cross-Origin Resource Sharing) problem. Please ensure the Jira instance URL is correct (including http/https), your network connection is stable, and the Jira server is configured to allow requests from this application\'s domain. Check the browser console for more specific error details.';
      } else {
          detailedErrorMessage += ' Please check the browser console for more details.';
      }
      setJiraImportError(detailedErrorMessage);
       // Keep modal open to show the error
    } finally {
      setJiraImportLoading(false);
    }
  };


  const renderContent = () => {
    switch (appPhase) {
      case 'WELCOME':
        return (
          <div className="text-center p-10 bg-white shadow-xl rounded-lg">
            <h2 className="text-3xl font-bold text-primary mb-4">Welcome to {APP_TITLE}!</h2>
            <p className="text-neutral-700 mb-8 text-lg">
              Facilitate your sprint planning with interactive poker voting.
            </p>
            <ActionButton onClick={() => setAppPhase('SESSION_ACTIVE')} variant="primary" className="px-8 py-3 text-lg">
              Start New Poker Session
            </ActionButton>
          </div>
        );
      case 'SESSION_ACTIVE':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <TaskInputForm 
                onAddTask={handleAddTask} 
                onImportTasks={handleBulkAddTasks}
              />
               <div className="p-4 bg-white shadow rounded-lg space-y-3">
                <h2 className="text-xl font-semibold text-neutral-800">Or Import from Jira</h2>
                <ActionButton 
                  onClick={() => {
                    setJiraImportError(null); // Clear previous errors when opening
                    setIsJiraImportModalOpen(true);
                  }} 
                  variant="secondary" 
                  className="w-full"
                >
                  Import from Jira
                </ActionButton>
              </div>
              <TaskList tasks={tasks} selectedTaskId={selectedTaskId} onSelectTask={handleSelectTask} onDeleteTask={handleDeleteTask}/>
              <ActionButton onClick={() => setAppPhase('SESSION_SUMMARY')} variant="outline" className="w-full mt-4">
                End Session & View Summary
              </ActionButton>
            </div>
            <div className="md:col-span-2">
              <VotingSection 
                task={selectedTask} 
                onVote={handleVote} 
                onRevealVotes={handleRevealVotes}
                onClearVotes={handleClearVotes}
                currentUserName={currentUserName}
                onSetCurrentUserName={setCurrentUserName}
              />
            </div>
          </div>
        );
      case 'SESSION_SUMMARY':
        return (
          <SessionSummary
            tasks={tasks}
            onExportMarkdown={handleExportMarkdown}
            onStartNewSession={handleStartNewSession}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        {renderContent()}
      </main>
      {isJiraImportModalOpen && (
        <JiraImportModal
          isOpen={isJiraImportModalOpen}
          onClose={() => setIsJiraImportModalOpen(false)}
          onImportJiraTasks={handleFetchAndAddJiraTasks}
          isLoading={jiraImportLoading}
          error={jiraImportError}
        />
      )}
      <footer className="text-center py-4 text-sm text-neutral-700 border-t border-neutral-200">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;
