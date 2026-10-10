import { UploadCloud, FolderPlus, FolderOpen } from "lucide-react";

export default function ProjectFilesTab() {
  return (
    <div className="tab-pane active fade-in">
      <div className="files-container">
        {/* Storage Bar (Like Cubicl) */}
        <div className="files-storage-bar">
          <div className="storage-info">
            <FolderOpen size={24} style={{ marginRight: '10px' }} />
            <div>
              <strong>1.2 TB Storage Size</strong>
              <small style={{ color: 'var(--primary-color)' }}>0 B Used</small>
            </div>
          </div>
          
          <div className="storage-stats">
            <div>
              <small>Document</small>
              <span>0 B</span>
            </div>
            <div>
              <small>Image</small>
              <span>0 B</span>
            </div>
            <div>
              <small>Video</small>
              <span>0 B</span>
            </div>
            <div>
              <small>Other</small>
              <span>0 B</span>
            </div>
          </div>

          <div className="storage-actions">
            <button className="secondary-button" style={{ marginRight: '8px' }}>
              <FolderPlus size={15} style={{ marginRight: 6 }} />
              Create Folder
            </button>
            <button className="primary-button">
              Upload File
              <UploadCloud size={15} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>

        <div className="files-empty-state">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-folder-5364175-4494957.png" alt="Empty Folder" style={{ width: '200px', opacity: 0.7 }} />
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>There are no files in this folder yet.</p>
          <button className="primary-button mt-4">
            Upload File
            <UploadCloud size={15} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
