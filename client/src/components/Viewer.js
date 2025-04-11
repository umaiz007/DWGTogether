import React, { useEffect, useRef } from 'react';

const Viewer = ({ file }) => {
    const viewerContainer = useRef(null);

    useEffect(() => {
        // TODO: Initialize Autodesk Viewer when API access is available
        console.log('Viewer initialized for file:', file);
        
        // Placeholder for viewer initialization
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.backgroundColor = '#f0f0f0';
        placeholder.innerHTML = `
            <div style="text-align: center;">
                <h3>DWG Viewer</h3>
                <p>Selected file: ${file.name}</p>
                <p>APS Viewer will be initialized here</p>
            </div>
        `;
        
        if (viewerContainer.current) {
            viewerContainer.current.appendChild(placeholder);
        }

        return () => {
            if (viewerContainer.current) {
                viewerContainer.current.innerHTML = '';
            }
        };
    }, [file]);

    return (
        <div className="viewer-container" ref={viewerContainer}>
            {/* Viewer will be initialized here */}
        </div>
    );
};

export default Viewer; 