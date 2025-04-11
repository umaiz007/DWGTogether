import React, { useState } from 'react';

const FileBrowser = ({ onFileSelect }) => {
    const [files, setFiles] = useState([
        { id: 1, name: 'Stormwater_Design_1.dwg', date: '2024-02-10', size: '2.5 MB' },
        { id: 2, name: 'Catch_Basins_Plan.dwg', date: '2024-02-09', size: '1.8 MB' },
        { id: 3, name: 'Pipe_Network.dwg', date: '2024-02-08', size: '3.2 MB' }
    ]);

    return (
        <div className="file-browser">
            <div className="file-browser-header">
                <h2>DWG Files</h2>
                <div className="file-actions">
                    <button className="refresh-btn">Refresh</button>
                    <button className="upload-btn">Upload</button>
                </div>
            </div>
            <div className="file-list">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date Modified</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id} onClick={() => onFileSelect(file)}>
                                <td>{file.name}</td>
                                <td>{file.date}</td>
                                <td>{file.size}</td>
                                <td>
                                    <button 
                                        className="view-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFileSelect(file);
                                        }}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FileBrowser; 