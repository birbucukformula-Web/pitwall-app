import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { metadataApi } from "../../api/metadata";
import { 
  ChevronDown, 
  ArrowRight, 
  Layers3, 
  FolderOpen, 
  CheckSquare, 
  Users 
} from "lucide-react";

import "./Projects.css";

// Ağaç yapısı için tip
type UnitNode = {
  id: number;
  name: string;
  description: string;
  code: string;
  parent: number | null;
  task_count: number;
  member_count: number;
  children: UnitNode[];
};

// Öz-yinelemeli ağaç oluşturucu
function buildTree(units: any[], parentId: number | null = null): UnitNode[] {
  return units
    .filter(u => u.parent === parentId)
    .map(u => ({
      ...u,
      description: u.code || "Birim",
      children: buildTree(units, u.id)
    }));
}

function UnitTreeNode({ node, level, onNavigate }: { node: UnitNode, level: number, onNavigate: (id: number) => void }) {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Kökler açık gelsin

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node-wrapper" style={{ marginLeft: level > 0 ? "24px" : "0" }}>
      <div className={`tree-node ${level === 0 ? 'tree-node-root' : ''}`}>
        <div 
          className="tree-node-left" 
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          style={{ cursor: hasChildren ? "pointer" : "default" }}
        >
          {hasChildren ? (
            <button 
              className="tree-expand-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ArrowRight size={18} />}
            </button>
          ) : (
            <div className="tree-expand-spacer" />
          )}

          <div className="tree-node-icon">
            {level === 0 ? <Layers3 size={20} /> : <FolderOpen size={18} />}
          </div>

          <div className="tree-node-info">
            <h4>{node.name}</h4>
            {level === 0 && <span>{node.description}</span>}
          </div>
        </div>

        <div className="tree-node-stats">
          <div className="tree-stat" title="Aktif Görevler">
            <CheckSquare size={15} /> <span>{node.task_count}</span>
          </div>
          <div className="tree-stat" title="Üyeler">
            <Users size={15} /> <span>{node.member_count}</span>
          </div>
          
          <button 
            className="tree-nav-btn" 
            onClick={() => onNavigate(node.id)}
            title="Panoya Git"
          >
            Panoya Git <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-node-children">
          {node.children.map(child => (
            <UnitTreeNode key={child.id} node={child} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const rootNodes = buildTree(units, null);

  const handleUnitClick = (unitId: number) => {
    navigate(`/projects/${unitId}`);
  };

  return (
    <section className="projects-page">
      <div className="projects-inner">
        <div className="projects-section-header">
          <div>
            <h2>Departmanlar</h2>
            <p>
              Dahil olduğun takımların birimlerini ve alt kırılımlarını ağaç yapısında görebilir, dilediğin birimin panosuna gidebilirsin.
            </p>
          </div>
          <span className="projects-team-count">
            {rootNodes.length} Birim
          </span>
        </div>

        <div className="tree-view-container">
          {isLoading && <p style={{color: 'var(--text-muted)'}}>Organizasyon yükleniyor...</p>}
          {!isLoading && rootNodes.length === 0 && (
            <p style={{color: 'var(--text-muted)'}}>Henüz hiçbir birime dahil değilsiniz veya birim bulunamadı.</p>
          )}
          {rootNodes.map(node => (
            <UnitTreeNode key={node.id} node={node} level={0} onNavigate={handleUnitClick} />
          ))}
        </div>
      </div>
    </section>
  );
}