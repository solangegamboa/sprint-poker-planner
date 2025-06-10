import React, { useState } from 'react';
import ActionButton from './ActionButton';

interface JiraImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportJiraTasks: (
    jiraInstanceUrl: string,
    email: string,
    apiToken: string,
    jqlQuery: string
  ) => Promise<void>; // Make it async to handle loading state in App.tsx
  isLoading: boolean;
  error: string | null;
}

const JiraImportModal: React.FC<JiraImportModalProps> = ({
  isOpen,
  onClose,
  onImportJiraTasks,
  isLoading,
  error,
}) => {
  const [jiraInstanceUrl, setJiraInstanceUrl] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [jqlQuery, setJqlQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jiraInstanceUrl.trim() || !email.trim() || !apiToken.trim() || !jqlQuery.trim()) {
      alert('All Jira fields are required.');
      return;
    }
    // The actual API call and subsequent closing/error handling is managed by onImportJiraTasks in App.tsx
    await onImportJiraTasks(jiraInstanceUrl.trim(), email.trim(), apiToken.trim(), jqlQuery.trim());
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-neutral-800 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      aria-labelledby="jira-import-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 id="jira-import-modal-title" className="text-xl font-semibold text-neutral-800">
            Import Tasks from Jira
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            aria-label="Close Jira import modal"
            disabled={isLoading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jiraInstanceUrl" className="block text-sm font-medium text-neutral-700">
              Jira Instance URL (e.g., https://your-company.atlassian.net)
            </label>
            <input
              type="url"
              id="jiraInstanceUrl"
              value={jiraInstanceUrl}
              onChange={(e) => setJiraInstanceUrl(e.target.value)}
              className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
              placeholder="https://your-domain.atlassian.net"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Jira Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="apiToken" className="block text-sm font-medium text-neutral-700">
              Jira API Token (Not your password)
            </label>
            <input
              type="password"
              id="apiToken"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
              placeholder="Your Jira API Token"
              disabled={isLoading}
            />
             <p className="text-xs text-neutral-500 mt-1">
              Create API tokens from your Jira account settings under 'Security'.
            </p>
          </div>

          <div>
            <label htmlFor="jqlQuery" className="block text-sm font-medium text-neutral-700">
              JQL Query (e.g., project = MYPROJ AND status = "To Do")
            </label>
            <textarea
              id="jqlQuery"
              value={jqlQuery}
              onChange={(e) => setJqlQuery(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
              placeholder='project = "YourProject" AND status = "To Do" ORDER BY created DESC'
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <p className="text-xs text-neutral-600">
            <strong>Note:</strong> Direct Jira API calls from the browser may be blocked by CORS (Cross-Origin Resource Sharing) policies
            if your Jira instance is not configured to allow requests from this application's domain.
            Credentials are used for this request only and are not stored.
          </p>

          <div className="flex justify-end space-x-3">
            <ActionButton type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Fetching...' : 'Fetch Tasks'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JiraImportModal;
