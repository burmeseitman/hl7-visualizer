import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Stethoscope,
  Search,
  X,
  ChevronsUpDown,
  ChevronsDownUp,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Hash,
  Activity,
  ArrowRight,
  ChevronUp,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseHL7, validateHL7 } from './hl7Parser';
import type { HL7Node, ValidationResult } from './hl7Parser';
import { HL7_DEFINITIONS, MESSAGE_TYPES, MESSAGE_EVENTS, DATA_TYPES, SEGMENT_COLORS } from './definitions';
import './App.css';

// ─── Sample Messages ──────────────────────────────────────────────────────────
const SAMPLE_MESSAGES: Record<string, { label: string; message: string; description: string }> = {
  adt_a01: {
    label: 'ADT A01 — Admit Patient',
    description: 'Patient admission with demographics, visit info, and observation',
    message: `MSH|^~\\&|LAB|GENERAL_HOSPITAL|ADT|DEST|20231023120000||ADT^A01|MSG12345|P|2.5\rEVN|A01|20231023120000\rPID|1||12345^^^MRN^MR||SMITH^JOHN^A^JR^DR||19800101|M|||123 MAIN ST^^ANYTOWN^NY^12345^USA||(555)555-5555|(555)555-7777|ENG|S|||ACC-0012345\rNK1|1|SMITH^MARY^J|SPO|123 MAIN ST^^ANYTOWN^NY^12345|(555)555-5556||EC\rPV1|1|I|2000^201^01||||1234^DOCTOR^JOE^E^^^MD|||SUR||||ADM|A0|||||1234567|||||||||||||||||||||||||20231023120000\rDG1|1||I10^Essential (primary) hypertension^ICD10||20231023120000|A\rOBX|1|NM|50813-0^Oxygen Saturation^LN||98|%|95-100|N|||F|||20231023120000`,
  },
  oru_r01: {
    label: 'ORU R01 — Lab Results',
    description: 'Observation result with multiple test values',
    message: `MSH|^~\\&|LAB_SYS|MERCY_LAB|EHR|MERCY_HOSP|20231024083000||ORU^R01|LAB98765|P|2.5\rPID|1||67890^^^MRN^MR||JONES^JANE^M||19751215|F|||456 OAK AVE^^SPRINGFIELD^IL^62701^USA||(217)555-1234\rOBR|1|ORD-001|FIL-002|1554-5^Glucose [Mass/volume] in Serum^LN|||20231024070000|||||||||4321^BROWN^SARAH^L^^^MD\rOBX|1|NM|2345-7^Glucose [Mass/volume] in Serum^LN||105|mg/dL|70-100|H|||F|||20231024080000\rOBX|2|NM|718-7^Hemoglobin [Mass/volume] in Blood^LN||13.5|g/dL|12.0-17.5|N|||F|||20231024080000\rOBX|3|NM|4544-3^Hematocrit [Volume Fraction] of Blood^LN||41|%|37-47|N|||F|||20231024080000`,
  },
  orm_o01: {
    label: 'ORM O01 — New Order',
    description: 'Order message for a laboratory test',
    message: `MSH|^~\\&|EHR|GENERAL_HOSP|LAB|LAB_DEPT|20231025093000||ORM^O01|ORD55555|P|2.5\rPID|1||11111^^^MRN||DAVIS^ROBERT^C||19651030|M|||789 ELM ST^^RIVERSIDE^CA^92501\rORC|NW|ORD-5001|||||^^^20231025140000^^R|||||5678^WILLIAMS^ALICE^M^^^MD\rOBR|1|ORD-5001||80048^Basic Metabolic Panel^LN|||20231025093000|||||||||5678^WILLIAMS^ALICE^M^^^MD||||||F`,
  },
  ack: {
    label: 'ACK — General Acknowledgment',
    description: 'Application acknowledgment for a received message',
    message: `MSH|^~\\&|DEST|RECEIVING_HOSP|SOURCE|SENDING_HOSP|20231023120500||ACK^A01|ACK12345|P|2.5\rMSA|AA|MSG12345|Message received and processed successfully`,
  },
};

const DEFAULT_MESSAGE = SAMPLE_MESSAGES.adt_a01.message;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (raw: string): string => {
  if (!raw || raw.length < 8) return raw;
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
};

const calcAge = (dob: string): number | null => {
  if (!dob || dob.length < 8) return null;
  const birthDate = new Date(
    parseInt(dob.slice(0, 4), 10),
    parseInt(dob.slice(4, 6), 10) - 1,
    parseInt(dob.slice(6, 8), 10),
  );
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 0 ? age : null;
};

// Tokenise a raw HL7 line into coloured spans
const tokenizeLine = (line: string, fieldSep: string, segmentColors: Record<string, string>) => {
  const parts = line.split(fieldSep);
  const segName = parts[0];
  const color = segmentColors[segName] || '#94a3b8';
  const tokens: { text: string; cls: string; color?: string }[] = [];

  tokens.push({ text: segName, cls: 'hl7-seg-name', color });
  for (let i = 1; i < parts.length; i++) {
    tokens.push({ text: fieldSep, cls: 'hl7-sep-field' });
    // highlight sub-separators inside each field
    const field = parts[i];
    const innerTokens = field.split(/([\^~&])/).map((chunk, ci) => {
      if (chunk === '^') return <span key={ci} className="hl7-sep-comp">^</span>;
      if (chunk === '~') return <span key={ci} className="hl7-sep-rep">~</span>;
      if (chunk === '&') return <span key={ci} className="hl7-sep-sub">&amp;</span>;
      return <span key={ci}>{chunk}</span>;
    });
    tokens.push({ text: field, cls: 'hl7-field-val', inner: innerTokens } as never);
  }
  return { tokens, segName, color };
};

// ─── Patient Summary ──────────────────────────────────────────────────────────
interface PatientSummaryProps {
  segments: HL7Node[];
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ segments }) => {
  const pid = segments.find(s => s.label === 'PID');
  const pv1 = segments.find(s => s.label === 'PV1');
  if (!pid) return null;

  const getField = (seg: HL7Node, pos: number) => seg.children?.find(c => c.position === pos)?.value || '';

  const rawName = getField(pid, 5);
  const nameParts = rawName.split('^');
  const lastName = nameParts[0] || '';
  const firstName = nameParts[1] || '';
  const middleName = nameParts[2] || '';
  const fullName = [firstName, middleName ? middleName[0] + '.' : '', lastName].filter(Boolean).join(' ');

  const dob = getField(pid, 7);
  const sex = getField(pid, 8);
  const mrn = getField(pid, 3).split('^')[0];
  const account = getField(pid, 18).split('^')[0];

  const pClass = pv1 ? getField(pv1, 2) : '';
  const classMap: Record<string, string> = { I: 'Inpatient', O: 'Outpatient', E: 'Emergency', P: 'Pre-admit', R: 'Recurring' };
  const patientClass = classMap[pClass] || pClass;

  const age = calcAge(dob);
  const sexLabel = sex === 'M' ? 'Male' : sex === 'F' ? 'Female' : sex || 'Unknown';

  return (
    <motion.div
      className="patient-summary-card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="patient-avatar">
        <User size={22} />
      </div>
      <div className="patient-info">
        <span className="patient-name">{fullName || 'Unknown Patient'}</span>
        <div className="patient-meta">
          {dob && (
            <span className="meta-item">
              <Calendar size={12} />
              {formatDate(dob)}{age !== null ? ` (${age}y)` : ''}
            </span>
          )}
          <span className="meta-item">
            <Activity size={12} />
            {sexLabel}
          </span>
          {mrn && (
            <span className="meta-item">
              <Hash size={12} />
              MRN: {mrn}
            </span>
          )}
          {account && (
            <span className="meta-item">
              <Hash size={12} />
              Acct: {account}
            </span>
          )}
          {patientClass && (
            <span className={`patient-class-badge ${pClass.toLowerCase()}`}>
              {patientClass}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Message Summary Bar ──────────────────────────────────────────────────────
interface MessageSummaryBarProps {
  segments: HL7Node[];
  validation: ValidationResult | null;
  onSegmentJump: (segId: string) => void;
}

const MessageSummaryBar: React.FC<MessageSummaryBarProps> = ({ segments, validation, onSegmentJump }) => {
  if (!segments.length) return null;

  const msh = segments.find(s => s.label === 'MSH');
  const getField = (seg: HL7Node, pos: number) => seg?.children?.find(c => c.position === pos)?.value || '';

  const msgTypeRaw = msh ? getField(msh, 9) : '';
  const [msgCode, msgEvent] = msgTypeRaw.split('^');
  const sendingApp = msh ? getField(msh, 3) : '';
  const sendingFacility = msh ? getField(msh, 4) : '';
  const receivingApp = msh ? getField(msh, 5) : '';
  const version = msh ? getField(msh, 12) : '';

  const msgTypeName = MESSAGE_TYPES[msgCode] || '';
  const eventName = MESSAGE_EVENTS[msgEvent] || msgEvent || '';

  return (
    <div className="message-summary-bar">
      <div className="summary-left">
        {msgCode && (
          <div className="msg-type-pill">
            <span className="msg-code">{msgCode}</span>
            {msgEvent && <span className="msg-event">{msgEvent}</span>}
          </div>
        )}
        {eventName && <span className="event-label">{eventName}</span>}
        {msgTypeName && <span className="type-label" title={msgTypeName}>{msgTypeName.split('—')[0].trim()}</span>}
      </div>

      <div className="summary-flow">
        {sendingApp && <span className="flow-node">{sendingApp}</span>}
        {sendingFacility && <span className="flow-facility">@ {sendingFacility}</span>}
        {(sendingApp || sendingFacility) && (receivingApp) && (
          <ArrowRight size={14} className="flow-arrow" />
        )}
        {receivingApp && <span className="flow-node receiver">{receivingApp}</span>}
        {version && <span className="version-badge">v{version}</span>}
      </div>

      <div className="summary-right">
        <div className="segment-chips">
          {segments.map((seg) => (
            <button
              key={seg.id}
              className="seg-chip"
              style={{ '--seg-color': SEGMENT_COLORS[seg.label] || '#94a3b8' } as React.CSSProperties}
              onClick={() => onSegmentJump(seg.id)}
              title={HL7_DEFINITIONS[seg.label]?.name || seg.label}
            >
              {seg.label}
            </button>
          ))}
        </div>
        {validation && (
          <div className={`validation-badge ${validation.isValid ? 'valid' : 'invalid'}`}>
            {validation.isValid ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
            {validation.isValid
              ? validation.warnings.length > 0 ? `${validation.warnings.length} warning${validation.warnings.length > 1 ? 's' : ''}` : 'Valid'
              : `${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''}`}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Validation Panel ─────────────────────────────────────────────────────────
const ValidationPanel: React.FC<{ validation: ValidationResult }> = ({ validation }) => {
  if (validation.isValid && validation.warnings.length === 0) return null;

  return (
    <div className="validation-panel">
      {validation.errors.map((err, i) => (
        <div key={i} className="validation-item error">
          <AlertTriangle size={13} />
          <span>[{err.code}] {err.message}</span>
        </div>
      ))}
      {validation.warnings.map((warn, i) => (
        <div key={i} className="validation-item warning">
          <AlertTriangle size={13} />
          <span>[{warn.code}] {warn.message}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Syntax Highlighted View ──────────────────────────────────────────────────
interface HL7HighlightProps {
  raw: string;
  isEditing: boolean;
  onChange: (val: string) => void;
  onToggleEdit: () => void;
}

const HL7HighlightView: React.FC<HL7HighlightProps> = ({ raw, isEditing, onChange, onToggleEdit }) => {
  const lines = raw.split(/\r|\n/).filter(l => l.trim());
  const fieldSep = '|';

  if (isEditing) {
    return (
      <textarea
        value={raw}
        onChange={(e) => onChange(e.target.value)}
        className="hl7-textarea"
        autoFocus
        spellCheck={false}
      />
    );
  }

  return (
    <div className="hl7-highlight-view" onClick={onToggleEdit} title="Click to edit">
      {lines.map((line, i) => {
        const parts = line.split(fieldSep);
        const segName = parts[0];
        const color = SEGMENT_COLORS[segName] || '#94a3b8';

        return (
          <div key={i} className="hl7-line">
            <span className="hl7-seg-name" style={{ color }}>
              {segName}
            </span>
            {parts.slice(1).map((field, fi) => (
              <React.Fragment key={fi}>
                <span className="hl7-sep-field">|</span>
                {field.split(/([\^~&])/).map((chunk, ci) => {
                  if (chunk === '^') return <span key={ci} className="hl7-sep-comp">^</span>;
                  if (chunk === '~') return <span key={ci} className="hl7-sep-rep">~</span>;
                  if (chunk === '&') return <span key={ci} className="hl7-sep-sub">&amp;</span>;
                  return <span key={ci} className="hl7-field-val">{chunk}</span>;
                })}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tree Node ────────────────────────────────────────────────────────────────
interface TreeNodeProps {
  node: HL7Node;
  onSelect: (node: HL7Node) => void;
  level: number;
  selectedId?: string;
  hideEmpty: boolean;
  searchTerm: string;
  forceExpand?: boolean;
  nodeRef?: (el: HTMLDivElement | null, id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node, onSelect, level, selectedId, hideEmpty, searchTerm, forceExpand, nodeRef
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const isSelected = selectedId === node.id;
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceExpand !== undefined) setIsExpanded(forceExpand);
  }, [forceExpand]);

  // Filter empty if toggle is on
  const visibleChildren = node.children?.filter(child => {
    if (hideEmpty && child.isEmpty && (!child.children || child.children.length === 0)) return false;
    return true;
  });

  // Search match
  const lowerSearch = searchTerm.toLowerCase();
  const labelMatch = node.label.toLowerCase().includes(lowerSearch);
  const valueMatch = node.value?.toLowerCase().includes(lowerSearch) || false;
  const defName = getFieldName(node);
  const nameMatch = defName?.toLowerCase().includes(lowerSearch) || false;
  const isMatch = searchTerm.length > 0 && (labelMatch || valueMatch || nameMatch);
  const hasMatchingDescendant = searchTerm.length > 0 && hasMatch(node, searchTerm, hideEmpty);

  if (searchTerm.length > 0 && !isMatch && !hasMatchingDescendant) return null;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getIcon = () => {
    switch (node.type) {
      case 'segment': return <Database size={14} />;
      case 'field': return <Layers size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const segColor = node.type === 'segment' ? (SEGMENT_COLORS[node.label] || '#94a3b8') : undefined;

  return (
    <div
      className="tree-node-wrapper"
      ref={(el) => {
        (divRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        nodeRef?.(el, node.id);
      }}
    >
      <div
        className={`tree-node ${isSelected ? 'selected' : ''} ${isMatch ? 'search-match' : ''} type-${node.type}`}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={() => onSelect(node)}
      >
        <div className="node-toggle" onClick={toggleExpand}>
          {visibleChildren && visibleChildren.length > 0 ? (
            isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
          ) : (
            <div className="dot" />
          )}
        </div>
        <div className="node-icon" style={segColor ? { color: segColor } : undefined}>
          {getIcon()}
        </div>
        <div className="node-label">
          <span className="label-text" style={segColor ? { color: segColor } : undefined}>
            {node.label}
          </span>
          {defName && node.type !== 'segment' && (
            <span className="field-name-hint">{defName}</span>
          )}
          {node.isRepeating && <span className="repeat-badge">repeating</span>}
          {node.value && !(visibleChildren && visibleChildren.length > 0) && (
            <span className="value-preview">: {node.value}</span>
          )}
        </div>
        {node.type === 'segment' && (
          <span className="seg-def-name">{HL7_DEFINITIONS[node.label]?.name}</span>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && visibleChildren && visibleChildren.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="node-children"
          >
            {visibleChildren.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                onSelect={onSelect}
                level={level + 1}
                selectedId={selectedId}
                hideEmpty={hideEmpty}
                searchTerm={searchTerm}
                forceExpand={forceExpand}
                nodeRef={nodeRef}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getFieldName(node: HL7Node): string | null {
  if (node.type === 'segment') return null;
  const parts = node.label.split('-');
  const segCode = parts[0];
  const rest = parts[1] || '';
  const [fieldIdxRaw] = rest.split('.');
  const fieldIdx = fieldIdxRaw?.replace(/\[.*?\]/, ''); // strip repeat index

  const def = HL7_DEFINITIONS[segCode];
  if (!def?.fields) return null;
  return def.fields[fieldIdx]?.name || null;
}

function hasMatch(node: HL7Node, term: string, hideEmpty: boolean): boolean {
  const lowerTerm = term.toLowerCase();
  if (!node.children) return false;
  return node.children.some(child => {
    if (hideEmpty && child.isEmpty && !child.children?.length) return false;
    const defName = getFieldName(child);
    if (child.label.toLowerCase().includes(lowerTerm)) return true;
    if (child.value?.toLowerCase().includes(lowerTerm)) return true;
    if (defName?.toLowerCase().includes(lowerTerm)) return true;
    return hasMatch(child, term, hideEmpty);
  });
}

// ─── Definition Panel ─────────────────────────────────────────────────────────
const getExplanation = (node: HL7Node | null): string => {
  if (!node) return 'Select an item from the tree to see its definition.';

  let segmentCode = '';
  let fieldIdx = '';
  let compIdx = '';

  if (node.type === 'segment') {
    segmentCode = node.label;
  } else {
    const parts = node.label.split('-');
    segmentCode = parts[0];
    const fieldParts = (parts[1] || '').replace(/\[.*?\]/, '').split('.');
    fieldIdx = fieldParts[0];
    compIdx = fieldParts[1];
  }

  const definitionData = HL7_DEFINITIONS[segmentCode];
  if (!definitionData) {
    return `### ${segmentCode}\n\nNo detailed definition available for this segment. It may be a custom (Z) segment or a less common HL7 segment type.\n\nHL7 segments follow the format: \`SEGNAME|field1|field2|...\``;
  }

  let text = `# ${definitionData.name} (${segmentCode})\n\n${definitionData.description}\n\n`;

  // MSH-9 special handling
  if (segmentCode === 'MSH' && fieldIdx === '9') {
    const val = node.value || '';
    const [type, event] = val.split('^');
    text += `---\n### Field 9: Message Type\n\n`;
    if (type) text += `**Type**: \`${type}\` — ${MESSAGE_TYPES[type] || 'Unknown Message Type'}\n\n`;
    if (event) text += `**Event**: \`${event}\` — ${MESSAGE_EVENTS[event] || 'Unknown Event Type'}\n\n`;
    return text;
  }

  if (node.type === 'field' || node.type === 'component' || node.type === 'sub-component') {
    const fieldDef = definitionData.fields?.[fieldIdx];
    if (fieldDef) {
      text += `---\n### Field ${fieldIdx}: ${fieldDef.name}\n\n`;
      if (fieldDef.required) text += `> ⚠️ **Required field**\n\n`;
      if (fieldDef.description) text += `${fieldDef.description}\n\n`;

      if (fieldDef.dataType && DATA_TYPES[fieldDef.dataType]) {
        const dataType = DATA_TYPES[fieldDef.dataType];
        text += `**Data Type**: \`${dataType.name}\` (${fieldDef.dataType})\n\n`;

        if (compIdx) {
          const compName = dataType.components[compIdx];
          if (compName) text += `**Component ${compIdx}**: ${compName}\n\n`;
        } else {
          text += `#### Component Breakdown:\n`;
          Object.entries(dataType.components).forEach(([idx, name]) => {
            text += `- **${idx}**: ${name}\n`;
          });
          text += '\n';
        }
      }
    } else {
      text += `---\n### Field ${fieldIdx}\n\nNo specific definition available for this field.\n\n`;
    }

    if (node.value) {
      text += `**Value**: \`${node.value}\``;
    }
  } else if (node.type === 'segment') {
    if (definitionData.fields) {
      text += `---\n#### Fields in ${segmentCode}:\n`;
      Object.entries(definitionData.fields).forEach(([idx, f]) => {
        text += `- **${segmentCode}-${idx}** — ${f.name}${f.required ? ' *(required)*' : ''}\n`;
      });
    } else {
      text += '---\nSelect a field within this segment for specific property descriptions.';
    }
  }

  return text;
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [rawMessage, setRawMessage] = useState(DEFAULT_MESSAGE);
  const [parsedSegments, setParsedSegments] = useState<HL7Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<HL7Node | null>(null);
  const [copied, setCopied] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [forceExpand, setForceExpand] = useState<boolean | undefined>(undefined);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'raw' | 'tree' | 'def'>('raw');
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParsedSegments(parseHL7(rawMessage));
    setValidation(validateHL7(rawMessage));
  }, [rawMessage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearMessage = () => {
    setRawMessage('');
    setSelectedNode(null);
    setValidation(null);
  };

  const handleSegmentJump = useCallback((segId: string) => {
    const el = nodeRefs.current.get(segId);
    if (el && treeContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const seg = parsedSegments.find(s => s.id === segId);
      if (seg) setSelectedNode(seg);
    }
  }, [parsedSegments]);

  const registerNodeRef = useCallback((el: HTMLDivElement | null, id: string) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const loadSample = (key: string) => {
    setRawMessage(SAMPLE_MESSAGES[key].message);
    setSelectedNode(null);
    setShowSampleMenu(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <Stethoscope className="logo-icon" />
          <h1>HL7 <span className="highlight">Visualizer</span></h1>
        </div>
        <div className="header-actions">
          {/* Sample Messages */}
          <div className="dropdown-wrapper">
            <button className="btn-secondary" onClick={() => setShowSampleMenu(!showSampleMenu)}>
              <BookOpen size={16} />
              <span>Samples</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showSampleMenu && (
                <motion.div
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  {Object.entries(SAMPLE_MESSAGES).map(([key, sample]) => (
                    <button key={key} className="dropdown-item" onClick={() => loadSample(key)}>
                      <span className="dropdown-label">{sample.label}</span>
                      <span className="dropdown-desc">{sample.description}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleCopy} className={`btn-secondary ${copied ? 'active' : ''}`}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button onClick={clearMessage} className="btn-danger">
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Message Summary Bar */}
        {parsedSegments.length > 0 && (
          <MessageSummaryBar
            segments={parsedSegments}
            validation={validation}
            onSegmentJump={handleSegmentJump}
          />
        )}

        {/* Patient Summary */}
        {parsedSegments.some(s => s.label === 'PID') && (
          <PatientSummary segments={parsedSegments} />
        )}

        {/* Validation errors/warnings */}
        {validation && (!validation.isValid || validation.warnings.length > 0) && (
          <ValidationPanel validation={validation} />
        )}

        {/* Mobile Tabs */}
        <div className="mobile-tabs">
          {(['raw', 'tree', 'def'] as const).map(tab => (
            <button
              key={tab}
              className={`mobile-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'raw' ? 'Message' : tab === 'tree' ? 'Explorer' : 'Details'}
            </button>
          ))}
        </div>

        {/* 3-column layout */}
        <div className="content-layout">
          {/* Raw Message Panel */}
          <section className={`input-panel section-card mobile-tab-content ${activeTab === 'raw' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Raw HL7 Message</h2>
              <button
                className="icon-btn"
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? 'Preview mode' : 'Edit mode'}
              >
                {isEditing ? <Eye size={16} /> : <RefreshCw size={16} />}
                <span>{isEditing ? 'Preview' : 'Editing'}</span>
              </button>
            </div>
            <HL7HighlightView
              raw={rawMessage}
              isEditing={isEditing}
              onChange={setRawMessage}
              onToggleEdit={() => setIsEditing(true)}
            />
          </section>

          {/* Tree Panel */}
          <section className={`tree-panel section-card mobile-tab-content ${activeTab === 'tree' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Structure Explorer</h2>
              <div className="tree-controls">
                <button
                  className={`icon-btn ${hideEmpty ? 'active' : ''}`}
                  onClick={() => setHideEmpty(!hideEmpty)}
                  title={hideEmpty ? 'Show empty fields' : 'Hide empty fields'}
                >
                  {hideEmpty ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button className="icon-btn" onClick={() => setForceExpand(true)} title="Expand all">
                  <ChevronsUpDown size={14} />
                </button>
                <button className="icon-btn" onClick={() => setForceExpand(false)} title="Collapse all">
                  <ChevronsDownUp size={14} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="tree-search-bar">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search fields, names, values..."
                className="tree-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="tree-container" ref={treeContainerRef}>
              {parsedSegments.length > 0 ? (
                parsedSegments.map((seg) => (
                  <TreeNode
                    key={seg.id}
                    node={seg}
                    onSelect={setSelectedNode}
                    level={0}
                    selectedId={selectedNode?.id}
                    hideEmpty={hideEmpty}
                    searchTerm={searchTerm}
                    forceExpand={forceExpand}
                    nodeRef={registerNodeRef}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <FileText size={40} />
                  <p>Input an HL7 message to explore its structure</p>
                </div>
              )}
            </div>
          </section>

          {/* Definition Panel */}
          <section className={`definition-panel section-card mobile-tab-content ${activeTab === 'def' ? 'active' : ''}`}>
            <div className="panel-header">
              <h2>Definition & Details</h2>
              <HelpCircle size={16} className="help-icon" />
            </div>
            <div className="definition-content">
              <AnimatePresence mode="wait">
                {selectedNode ? (
                  <motion.div
                    key={selectedNode.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="def-view"
                  >
                    <div className="def-header">
                      <span className={`badge ${selectedNode.type}`}>{selectedNode.type}</span>
                      <h3>{selectedNode.label}</h3>
                      {selectedNode.value && (
                        <span className="def-value-tag">{selectedNode.value}</span>
                      )}
                    </div>
                    <div className="def-body">
                      <div className="def-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {getExplanation(selectedNode)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-state"
                  >
                    <Database size={40} />
                    <p>Click any node in the tree to see its definition</p>
                    <p className="empty-hint">Tip: Use the search bar to find specific fields</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>HL7 (Health Level Seven International) Visualizer · Built with precision</p>
      </footer>
    </div>
  );
};

export default App;
