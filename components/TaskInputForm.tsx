import React, { useState, ChangeEvent } from 'react';
import ActionButton from './ActionButton';

interface TaskInputFormProps {
  onAddTask: (identifier: string) => void;
  onImportTasks: (identifiers: string[]) => void; // New prop for CSV import
}

const TaskInputForm: React.FC<TaskInputFormProps> = ({ onAddTask, onImportTasks }) => {
  const [identifier, setIdentifier] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Used to reset file input

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim()) {
      onAddTask(identifier.trim());
      setIdentifier('');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  const handleImportCsv = () => {
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split(/\r\n|\n/); // Split by new line
          const taskIdentifiers = lines
            .map(line => line.trim())
            .filter(line => line.length > 0); // Get non-empty lines

          if (taskIdentifiers.length > 0) {
            onImportTasks(taskIdentifiers);
          } else {
            alert("CSV file is empty or contains no valid task identifiers.");
          }
        }
      } catch (error) {
        console.error("Error parsing CSV file:", error);
        alert("Failed to parse CSV file. Please ensure it's a valid CSV with one task identifier per line.");
      } finally {
        setCsvFile(null); // Reset file selection
        setFileInputKey(Date.now()); // Reset file input visually
      }
    };
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        alert("Error reading the selected file.");
        setCsvFile(null);
        setFileInputKey(Date.now());
    }
    reader.readAsText(csvFile);
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg space-y-6">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Add New Task</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter Task ID (e.g., JIRA-123)"
            className="flex-grow p-2 border border-neutral-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            aria-label="New task identifier"
          />
          <ActionButton type="submit" variant="primary" disabled={!identifier.trim()}>
            Add Task
          </ActionButton>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Or Import Tasks from CSV</h2>
        <div className="space-y-3">
          <input
            key={fileInputKey} // Add key to allow resetting
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary/10 file:text-primary
                       hover:file:bg-primary/20 cursor-pointer"
            aria-label="Import tasks from CSV file"
          />
          <ActionButton 
            onClick={handleImportCsv} 
            variant="secondary" 
            disabled={!csvFile}
            className="w-full sm:w-auto"
          >
            Import from CSV
          </ActionButton>
        </div>
        {csvFile && <p className="text-xs text-neutral-600 mt-2">Selected file: {csvFile.name}</p>}
      </div>
    </div>
  );
};

export default TaskInputForm;
