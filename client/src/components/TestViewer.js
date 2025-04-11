import React, { useState } from 'react';
import DWGViewer from './DWGViewer';

const TestViewer = () => {
  const [fileUrn, setFileUrn] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleTest = async () => {
    try {
      // Get access token from your authentication endpoint
      const response = await fetch('http://localhost:5001/api/auth/token');
      const data = await response.json();
      setAccessToken(data.access_token);

      // Get a test file URN from your ACC endpoint
      const projectsResponse = await fetch('http://localhost:5001/api/acc/projects');
      const projects = await projectsResponse.json();
      
      if (projects.length > 0) {
        const filesResponse = await fetch(`http://localhost:5001/api/acc/projects/${projects[0].id}/files`);
        const files = await filesResponse.json();
        
        if (files.length > 0) {
          setFileUrn(files[0].urn);
        }
      }
    } catch (error) {
      console.error('Error during test:', error);
    }
  };

  return (
    <div className="test-container">
      <h2>DWG Viewer Test</h2>
      <button onClick={handleTest}>Load Test File</button>
      
      {fileUrn && accessToken ? (
        <DWGViewer fileUrn={fileUrn} accessToken={accessToken} />
      ) : (
        <p>Click the button to load a test file</p>
      )}
    </div>
  );
};

export default TestViewer; 