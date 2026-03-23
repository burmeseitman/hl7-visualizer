import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Trash2, 
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { parseHL7 } from './hl7Parser';
import type { HL7Node } from './hl7Parser';
import { HL7_DEFINITIONS } from './definitions';
import './App.css';

const DEFAULT_MESSAGE = `MSH|^~\\&|LAB|GENERIC|ADT|DEST|202310231200||ADT^A01|12345|P|2.5\rPID|1||12345^^^MR||SMITH^JOHN^A||19800101|M|||123 MAIN ST^^ANYTOWN^NY^12345||(555)555-5555\rPV1|1|I|2000^2001^01||||1234^DOCTOR^JOE|||||||||||1234567\rOBX|1|NM|50813-0^Oxygen Saturation^LN||98|%|95-100|N|||F|||202310231200`;

const App: React.FC = () => {
  const [rawMessage, setRawMessage] = useState(DEFAULT_MESSAGE);
  const [parsedSegments, setParsedSegments] = useState<HL7Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<HL7Node | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setParsedSegments(parseHL7(rawMessage));
  }, [rawMessage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearMessage = () => {
    setRawMessage('');
    setSelectedNode(null);
  };

  const getExplanation = (node: HL7Node | null) => {
    if (!node) return "Select an item from the tree to see its definition.";

    // Get segment name (if it's a segment node, it's label; if it's field, it's split from label)
    let segmentCode = '';
    let fieldIdx = '';

    if (node.type === 'segment') {
      segmentCode = node.label;
    } else {
      const parts = node.label.split('-');
      segmentCode = parts[0];
      fieldIdx = parts[1]?.split('.')[0]; // Handle components too
    }

    const definitionData = HL7_DEFINITIONS[segmentCode];
    if (!definitionData) return `No detailed definition for segment "${segmentCode}". HL7 segments contain industrial standard data structures.`;

    let text = `### ${definitionData.name} (${segmentCode})\n\n${definitionData.description}\n\n`;

    if (node.type === 'field' || node.type === 'component') {
      const fieldDesc = definitionData.fields?.[fieldIdx];
      if (fieldDesc) {
        text += `---\n**Field ${fieldIdx}**: ${fieldDesc}\n\n`;
      }
      if (node.value) {
        text += `**Raw Value**: \`${node.value}\``;
      }
    } else if (node.type === 'segment') {
        text += "---\nSelect a field within this segment for specific property descriptions.";
    }

    return text;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <Stethoscope className="logo-icon" />
          <h1>HL7 <span className="highlight">Visualizer</span></h1>
        </div>
        <div className="header-actions">
          <button onClick={handleCopy} className={`btn-secondary ${copied ? 'active' : ''}`}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied' : 'Copy Message'}</span>
          </button>
          <button onClick={clearMessage} className="btn-danger">
            <Trash2 size={18} />
            <span>Clear</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Row 1: Input Panel */}
        <section className="input-panel section-card">
          <div className="panel-header">
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Raw HL7 Message</motion.h2>
          </div>
          <textarea
            value={rawMessage}
            onChange={(e) => setRawMessage(e.target.value)}
            placeholder="Paste your raw HL7 message here..."
            className="hl7-textarea"
          />
        </section>

        {/* Row 2: Content Panels (2 Columns) */}
        <div className="content-grid">
          {/* Tree View Column */}
          <section className="tree-panel section-card">
            <div className="panel-header">
              <h2>Structure Explorer</h2>
            </div>
            <div className="tree-container">
              {parsedSegments.length > 0 ? (
                parsedSegments.map((seg) => (
                  <TreeNode 
                    key={seg.id} 
                    node={seg} 
                    onSelect={setSelectedNode} 
                    level={0} 
                    selectedId={selectedNode?.id}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>Input an HL7 message to begin visualization</p>
                </div>
              )}
            </div>
          </section>

          {/* Definition Panel Column */}
          <section className="definition-panel section-card">
            <div className="panel-header">
              <h2>Definition & Details</h2>
              <HelpCircle size={20} className="help-icon" />
            </div>
            <div className="definition-content">
              {selectedNode ? (
                <motion.div 
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="def-view"
                >
                  <div className="def-header">
                    <span className={`badge ${selectedNode.type}`}>{selectedNode.type}</span>
                    <h3>{selectedNode.label}</h3>
                  </div>
                  <div className="def-body">
                    <div className="def-markdown">
                      {getExplanation(selectedNode).split('\n\n').map((para, i) => (
                        <p key={i}>{para.startsWith('###') ? <strong>{para.replace('###', '')}</strong> : para}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="empty-state">
                  <Database size={48} />
                  <p>Click any node in the tree to see its definition</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>HL7 (Health Level Seven International) Visualizer &bull; Built with precision</p>
      </footer>
    </div>
  );
};

interface TreeNodeProps {
  node: HL7Node;
  onSelect: (node: HL7Node) => void;
  level: number;
  selectedId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelect, level, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const isSelected = selectedId === node.id;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getIcon = () => {
    switch (node.type) {
      case 'segment': return <Database size={16} /> ;
      case 'field': return <Layers size={16} /> ;
      default: return <FileText size={16} /> ;
    }
  };

  return (
    <div className="tree-node-wrapper">
      <div 
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={() => onSelect(node)}
      >
        <div className="node-toggle" onClick={toggleExpand}>
          {node.children && node.children.length > 0 ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="dot" />
          )}
        </div>
        <div className="node-icon">{getIcon()}</div>
        <div className="node-label">
          <span className="label-text">{node.label}</span>
          {node.value && !node.children && (
            <span className="value-preview">: {node.value}</span>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="node-children"
          >
            {node.children.map((child) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                onSelect={onSelect} 
                level={level + 1} 
                selectedId={selectedId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
