import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { io } from 'socket.io-client';
import './DWGViewer.css';

const DWGViewer = ({ fileId }) => {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const [socket, setSocket] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  const handleMarkup = useCallback((type) => {
    setActiveTool(type);
    if (viewerInstance.current) {
      viewerInstance.current.markupExtension.activateTool(type);
    }
  }, []);

  const handleMarkupComplete = useCallback((markup) => {
    if (socket) {
      const objectData = {
        type: activeTool,
        data: markup,
        timestamp: Date.now(),
        userId: 'current-user-id', // Replace with actual user ID
        objectId: `obj_${Date.now()}` // Generate unique ID for the object
      };
      
      socket.emit('object-edit', objectData);
    }
  }, [socket, activeTool]);

  const handleObjectSelect = useCallback((event) => {
    if (viewerInstance.current && event.dbId) {
      const objectId = event.dbId;
      setSelectedObject(objectId);
      
      if (socket) {
        socket.emit('object-select', {
          objectId,
          userId: 'current-user-id' // Replace with actual user ID
        });
      }
    }
  }, [viewerInstance.current, socket]);

  const handleComment = useCallback((comment) => {
    if (socket && selectedObject) {
      const commentData = {
        objectId: selectedObject,
        text: comment,
        userId: 'current-user-id', // Replace with actual user ID
        timestamp: Date.now()
      };
      
      socket.emit('comment', commentData);
    }
  }, [socket, selectedObject]);

  useEffect(() => {
    // Load the Forge Viewer script
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.Autodesk) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Initialize the viewer
    const initViewer = async () => {
      try {
        await loadScript();
        
        if (viewerInstance.current) {
          viewerInstance.current.finish();
          viewerInstance.current = null;
        }

        const options = {
          env: 'AutodeskProduction',
          api: 'derivativeV2',
          getAccessToken: async (onTokenReady) => {
            try {
              const response = await fetch('/api/forge/token');
              const data = await response.json();
              onTokenReady(data.access_token, data.expires_in);
            } catch (error) {
              console.error('Error getting access token:', error);
            }
          }
        };

        viewerInstance.current = new Autodesk.Viewing.GuiViewer3D(viewerRef.current, options);
        viewerInstance.current.start();

        // Load the model
        const urn = `urn:${fileId}`;
        Autodesk.Viewing.Document.load(urn, (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry();
          viewerInstance.current.loadDocumentNode(doc, defaultModel);
        }, (error) => {
          console.error('Error loading document:', error);
        });

        // Enable markup tools when geometry is loaded
        viewerInstance.current.loadExtension('Autodesk.Viewing.MarkupsCore');
        viewerInstance.current.loadExtension('Autodesk.Viewing.MarkupsGui');
        
        // Add selection event listener
        viewerInstance.current.addEventListener('selectionChanged', handleObjectSelect);

      } catch (error) {
        console.error('Error initializing viewer:', error);
      }
    };

    // Initialize WebSocket connection
    const initializeSocket = () => {
      const socket = io('http://localhost:5001', {
        auth: {
          token: 'your-access-token' // Replace with actual access token
        },
        query: {
          fileId
        }
      });
      
      socket.on('connect', () => {
        console.log('Connected to collaboration server');
      });

      socket.on('object-edit', (data) => {
        if (viewerInstance.current) {
          viewerInstance.current.markupExtension.addMarkup(data);
        }
      });

      socket.on('object-select', (data) => {
        if (viewerInstance.current && data.objectId !== selectedObject) {
          viewerInstance.current.select([data.objectId]);
        }
      });

      socket.on('comment', (data) => {
        setComments(prev => [...prev, data]);
      });

      socket.on('user-update', (data) => {
        setUsers(data);
      });

      setSocket(socket);
    };

    if (fileId) {
      initViewer();
      initializeSocket();
    }

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.finish();
        viewerInstance.current = null;
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fileId, handleObjectSelect]);

  return (
    <div className="dwg-viewer-container">
      <div className="viewer-toolbar">
        <button onClick={() => handleMarkup('text')}>Text</button>
        <button onClick={() => handleMarkup('line')}>Line</button>
        <button onClick={() => handleMarkup('rectangle')}>Rectangle</button>
        <button onClick={() => handleMarkup('circle')}>Circle</button>
      </div>
      
      <div className="viewer-content">
        <Box
          ref={viewerRef}
          sx={{
            width: '100%',
            height: '100%',
            minHeight: '500px',
            position: 'relative'
          }}
        />
        
        <div className="collaboration-panel">
          <div className="users-section">
            <h3>Active Users</h3>
            <ul>
              {users.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
          </div>
          
          <div className="comments-section">
            <h3>Comments</h3>
            <div className="comments-list">
              {comments.map((comment, index) => (
                <div key={index} className="comment">
                  <strong>{comment.userId}:</strong> {comment.text}
                </div>
              ))}
            </div>
            {selectedObject && (
              <div className="comment-input">
                <input 
                  type="text" 
                  placeholder="Add a comment..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DWGViewer; 