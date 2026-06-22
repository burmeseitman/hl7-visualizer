export interface HL7Node {
  id: string;
  label: string;
  value?: string;
  rawValue?: string;
  description?: string;
  children?: HL7Node[];
  type: 'segment' | 'field' | 'component' | 'sub-component';
  position: number;
  isEmpty?: boolean;
  isRepeating?: boolean;
  repeatIndex?: number;
}

export interface HL7Message {
  raw: string;
  segments: HL7Node[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  version?: string;
  messageType?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  segment?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  segment?: string;
}

// Decode HL7 escape sequences
const decodeEscapeSequences = (val: string): string => {
  return val
    .replace(/\\F\\/g, '|')
    .replace(/\\S\\/g, '^')
    .replace(/\\R\\/g, '~')
    .replace(/\\E\\/g, '\\')
    .replace(/\\T\\/g, '&')
    .replace(/\\Hstart highlight\\/g, '')
    .replace(/\\Nend highlight\\/g, '');
};

export const parseHL7 = (raw: string): HL7Node[] => {
  if (!raw.trim()) return [];

  const segments = raw.split(/\r|\n/).filter(line => line.trim().length > 0);
  const fieldSep = raw.charAt(3) || '|';
  const compSep = (raw.charAt(4) || '^').substring(0, 1);
  const repSep = (raw.charAt(5) || '~').substring(0, 1);
  const subCompSep = (raw.charAt(7) || '&').substring(0, 1);

  return segments.map((segLine, sIdx) => {
    const fields = segLine.split(fieldSep);
    const segName = fields[0];
    const isMSH = segName === 'MSH';

    // MSH Special Handling (MSH-1 is the separator itself)
    const processedFields = isMSH ? [segName, fieldSep, ...fields.slice(1)] : fields;

    return {
      id: `seg-${sIdx}`,
      label: segName,
      type: 'segment',
      position: sIdx,
      isEmpty: false,
      children: processedFields.slice(1).map((fVal, fIdx) => {
        const fieldPos = fIdx + 1;
        const isEmpty = !fVal || fVal.trim() === '';

        // Handle repeating fields
        const repeats = fVal.split(repSep);
        const isRepeating = repeats.length > 1;

        if (isRepeating) {
          return {
            id: `seg-${sIdx}-f-${fieldPos}`,
            label: `${segName}-${fieldPos}`,
            value: fVal,
            rawValue: fVal,
            type: 'field' as const,
            position: fieldPos,
            isEmpty,
            isRepeating: true,
            children: repeats.map((repVal, repIdx) => {
              const components = repVal.split(compSep);
              return {
                id: `seg-${sIdx}-f-${fieldPos}-r-${repIdx + 1}`,
                label: `${segName}-${fieldPos}[${repIdx + 1}]`,
                value: decodeEscapeSequences(repVal),
                rawValue: repVal,
                type: 'field' as const,
                position: repIdx + 1,
                repeatIndex: repIdx + 1,
                isEmpty: !repVal || repVal.trim() === '',
                children: components.length > 1 ? buildComponents(segName, fieldPos, sIdx, `r-${repIdx + 1}`, components, compSep, subCompSep) : undefined,
              };
            }),
          };
        }

        // Non-repeating field
        const components = fVal.split(compSep);
        return {
          id: `seg-${sIdx}-f-${fieldPos}`,
          label: `${segName}-${fieldPos}`,
          value: decodeEscapeSequences(fVal),
          rawValue: fVal,
          type: 'field' as const,
          position: fieldPos,
          isEmpty,
          children: components.length > 1 ? buildComponents(segName, fieldPos, sIdx, '', components, compSep, subCompSep) : undefined,
        };
      }),
    };
  });
};

function buildComponents(
  segName: string,
  fieldPos: number,
  sIdx: number,
  prefix: string,
  components: string[],
  _compSep: string,
  subCompSep: string,
): HL7Node[] {
  return components.map((cVal, cIdx) => {
    const compPos = cIdx + 1;
    const subComponents = cVal.split(subCompSep);
    const baseId = prefix
      ? `seg-${sIdx}-f-${fieldPos}-${prefix}-c-${compPos}`
      : `seg-${sIdx}-f-${fieldPos}-c-${compPos}`;

    return {
      id: baseId,
      label: `${segName}-${fieldPos}.${compPos}`,
      value: decodeEscapeSequences(cVal),
      rawValue: cVal,
      type: 'component' as const,
      position: compPos,
      isEmpty: !cVal || cVal.trim() === '',
      children:
        subComponents.length > 1
          ? subComponents.map((scVal, scIdx) => ({
              id: `${baseId}-sc-${scIdx + 1}`,
              label: `${segName}-${fieldPos}.${compPos}.${scIdx + 1}`,
              value: decodeEscapeSequences(scVal),
              rawValue: scVal,
              type: 'sub-component' as const,
              position: scIdx + 1,
              isEmpty: !scVal || scVal.trim() === '',
            }))
          : undefined,
    };
  });
}

export const validateHL7 = (raw: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!raw.trim()) {
    return { isValid: false, errors: [{ code: 'EMPTY', message: 'Message is empty' }], warnings };
  }

  const lines = raw.split(/\r|\n/).filter(l => l.trim());

  // Check MSH is first
  if (!lines[0].startsWith('MSH')) {
    errors.push({ code: 'NO_MSH', message: 'Message must begin with MSH segment', segment: 'MSH' });
  }

  const mshLine = lines.find(l => l.startsWith('MSH'));
  let version: string | undefined;
  let messageType: string | undefined;

  if (mshLine) {
    const fields = mshLine.split('|');
    if (fields.length < 12) {
      warnings.push({ code: 'MSH_SHORT', message: `MSH segment has only ${fields.length} fields (expected at least 12)`, segment: 'MSH' });
    }

    // Version check (MSH-12)
    version = fields[11];
    if (!version) {
      warnings.push({ code: 'NO_VERSION', message: 'MSH-12 (Version ID) is missing', segment: 'MSH' });
    }

    // Message type check (MSH-9)
    const msgType = fields[8] || '';
    messageType = msgType;
    if (!msgType) {
      errors.push({ code: 'NO_MSG_TYPE', message: 'MSH-9 (Message Type) is required', segment: 'MSH' });
    }

    // Control ID (MSH-10)
    if (!fields[9]) {
      errors.push({ code: 'NO_CTRL_ID', message: 'MSH-10 (Message Control ID) is required', segment: 'MSH' });
    }
  }

  // Check for PID if ADT/ORU
  const hasPID = lines.some(l => l.startsWith('PID'));
  if (messageType?.startsWith('ADT') && !hasPID) {
    warnings.push({ code: 'ADT_NO_PID', message: 'ADT message typically requires a PID segment', segment: 'PID' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    version,
    messageType,
  };
};
