
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { metadataApi } from "../../api/metadata";

import {
  ChevronDown,
  ArrowRight,
  Layers3,
  FolderOpen,
  CheckSquare,
  Users,
} from "lucide-react";

import "./Projects.css";

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

type UnitData = Omit<UnitNode, "children">;

function buildTree(
  units: UnitData[],
  parentId: number | null = null
): UnitNode[] {
  return units
    .filter(
      (unit) => (unit.parent ?? null) === parentId
    )
    .map((unit) => ({
      id: unit.id,
      name: unit.name,
      code: unit.code || "",
      description:
        unit.description || unit.code || "Birim",
      parent: unit.parent ?? null,
      task_count: unit.task_count ?? 0,
      member_count: unit.member_count ?? 0,
      children: buildTree(units, unit.id),
    }));
}

function UnitTreeNode({
  node,
  level,
  onNavigate,
}: {
  node: UnitNode;
  level: number;
  onNavigate: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(
    level === 0
  );

  const hasChildren = node.children.length > 0;

  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded((previous) => !previous);
    }
  };

  return (
    <div
      className="tree-node-wrapper"
      style={{
        marginLeft: level > 0 ? "24px" : "0",
      }}
    >
      <div
        className={`tree-node ${
          level === 0 ? "tree-node-root" : ""
        }`}
      >
        <div
          className="tree-node-left"
          onClick={toggleExpanded}
          style={{
            cursor: hasChildren
              ? "pointer"
              : "default",
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              className="tree-expand-btn"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded();
              }}
              aria-label={
                isExpanded
                  ? "Birimi daralt"
                  : "Birimi genişlet"
              }
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
            </button>
          ) : (
            <div className="tree-expand-spacer" />
          )}

          <div className="tree-node-icon">
            {level === 0 ? (
              <Layers3 size={20} />
            ) : (
              <FolderOpen size={18} />
            )}
          </div>

          <div className="tree-node-info">
            <h4>{node.name}</h4>

            {level === 0 && (
              <span>{node.description}</span>
            )}
          </div>
        </div>

        <div className="tree-node-stats">
          <div
            className="tree-stat"
            title="Aktif Görevler"
          >
            <CheckSquare size={15} />
            <span>{node.task_count}</span>
          </div>

          <div
            className="tree-stat"
            title="Üyeler"
          >
            <Users size={15} />
            <span>{node.member_count}</span>
          </div>

          <button
            type="button"
            className="tree-nav-btn"
            onClick={() => onNavigate(node.id)}
            title="Panoya Git"
          >
            Panoya Git
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-node-children">
          {node.children.map((child) => (
            <UnitTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();

  const {
    data: apiUnits = [],
    isLoading,
  } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const units = useMemo<UnitData[]>(() => {
    return apiUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      code: unit.code || "",
      description: unit.description || "",
      parent: unit.parent ?? null,
      task_count: unit.task_count ?? 0,
      member_count: unit.member_count ?? 0,
    }));
  }, [apiUnits]);

  const rootNodes = useMemo(
    () => buildTree(units),
    [units]
  );

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
              Dahil olduğun takımların birimlerini ve
              alt kırılımlarını ağaç yapısında
              görebilir, dilediğin birimin panosuna
              gidebilirsin.
            </p>
          </div>

          <span className="projects-team-count">
            {rootNodes.length} Birim
          </span>
        </div>

        <div className="tree-view-container">
          {isLoading && rootNodes.length === 0 && (
            <p
              style={{
                color: "var(--text-muted)",
              }}
            >
              Organizasyon yükleniyor...
            </p>
          )}

          {!isLoading && rootNodes.length === 0 && (
            <p
              style={{
                color: "var(--text-muted)",
              }}
            >
              Henüz hiçbir birime dahil değilsiniz
              veya birim bulunamadı.
            </p>
          )}

          {rootNodes.map((node) => (
            <UnitTreeNode
              key={node.id}
              node={node}
              level={0}
              onNavigate={handleUnitClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
