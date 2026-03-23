export interface HL7Node {
  id: string;
  label: string;
  value?: string;
  description?: string;
  children?: HL7Node[];
  type: 'segment' | 'field' | 'component' | 'sub-component';
  position: number;
}

export interface HL7Message {
  raw: string;
  segments: HL7Node[];
}

export const parseHL7 = (raw: string): HL7Node[] => {
  if (!raw.trim()) return [];

  const segments = raw.split(/\r|\n/).filter(line => line.trim().length > 0);
  const fieldSep = raw.charAt(3) || '|'; // Always check position 4 (index 3) of MSH
  const compSep = (raw.charAt(4) || '^').substring(0, 1);
  const subCompSep = (raw.charAt(7) || '&').substring(0, 1);

  return segments.map((segLine, sIdx) => {
    const fields = segLine.split(fieldSep);
    const segName = fields[0];
    
    // MSH Special Handling (MSH-1 is the separator itself)
    const processedFields = segName === 'MSH' ? [segName, fieldSep, ...fields.slice(1)] : fields;

    return {
      id: `seg-${sIdx}`,
      label: segName,
      type: 'segment',
      position: sIdx,
      children: processedFields.slice(1).map((fVal, fIdx) => {
        const fieldPos = fIdx + 1;
        const components = fVal.split(compSep);
        
        return {
          id: `seg-${sIdx}-f-${fieldPos}`,
          label: `${segName}-${fieldPos}`,
          value: fVal,
          type: 'field',
          position: fieldPos,
          children: components.length > 1 ? components.map((cVal, cIdx) => {
            const compPos = cIdx + 1;
            const subComponents = cVal.split(subCompSep);

            return {
              id: `seg-${sIdx}-f-${fieldPos}-c-${compPos}`,
              label: `${segName}-${fieldPos}.${compPos}`,
              value: cVal,
              type: 'component',
              position: compPos,
              children: subComponents.length > 1 ? subComponents.map((scVal, scIdx) => ({
                id: `seg-${sIdx}-f-${fieldPos}-c-${compPos}-sc-${scIdx + 1}`,
                label: `${segName}-${fieldPos}.${compPos}.${scIdx + 1}`,
                value: scVal,
                type: 'sub-component',
                position: scIdx + 1
              })) : undefined
            };
          }) : undefined
        };
      })
    };
  });
};
