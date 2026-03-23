export interface Definition {
  name: string;
  description: string;
  fields?: Record<string, string>;
}

export const HL7_DEFINITIONS: Record<string, Definition> = {
  MSH: {
    name: "Message Header",
    description: "The MSH segment contains information about the message itself, such as sender, receiver, message type, and version.",
    fields: {
      "1": "Field Separator",
      "2": "Encoding Characters",
      "3": "Sending Application",
      "4": "Sending Facility",
      "5": "Receiving Application",
      "6": "Receiving Facility",
      "7": "Date/Time of Message",
      "9": "Message Type",
      "10": "Message Control ID",
      "11": "Processing ID",
      "12": "Version ID"
    }
  },
  PID: {
    name: "Patient Identification",
    description: "The PID segment is used by all applications as the primary method of addressing the patient for an event.",
    fields: {
      "3": "Patient Identifier List",
      "5": "Patient Name",
      "7": "Date/Time of Birth",
      "8": "Administrative Sex",
      "11": "Patient Address",
      "13": "Phone Number - Home",
      "14": "Phone Number - Business",
      "18": "Patient Account Number",
      "19": "SSN Number - Patient"
    }
  },
  PV1: {
    name: "Patient Visit",
    description: "The PV1 segment is used by registration applications to communicate information on an account or visit-specific basis.",
    fields: {
      "2": "Patient Class",
      "3": "Assigned Patient Location",
      "7": "Attending Doctor",
      "8": "Referring Doctor",
      "10": "Hospital Service",
      "19": "Visit Number",
      "44": "Admit Date/Time"
    }
  },
  OBX: {
    name: "Observation/Result",
    description: "The OBX segment is used to transmit a single observation or observation fragment.",
    fields: {
      "2": "Value Type",
      "3": "Observation Identifier",
      "5": "Observation Value",
      "6": "Units",
      "7": "References Range",
      "8": "Abnormal Flags",
      "11": "Observation Result Status",
      "14": "Date/Time of the Observation"
    }
  },
  OBR: {
    name: "Observation Request",
    description: "The OBR segment is used to transmit information about an observation request.",
    fields: {
      "4": "Universal Service Identifier",
      "7": "Observation Date/Time",
      "16": "Ordering Provider"
    }
  },
  EVN: {
    name: "Event Type",
    description: "The EVN segment is used to communicate necessary trigger event information to receiving applications.",
    fields: {
      "1": "Event Type Code",
      "2": "Recorded Date/Time",
      "4": "Event Reason Code"
    }
  },
  NK1: {
    name: "Next of Kin",
    description: "The NK1 segment contains information about the patient's next of kin or associated parties.",
    fields: {
      "2": "Name",
      "3": "Relationship",
      "13": "Organization Name - NK1"
    }
  },
  DG1: {
    name: "Diagnosis",
    description: "The DG1 segment contains patient diagnosis information.",
    fields: {
      "3": "Diagnosis Code - DG1",
      "6": "Diagnosis Type"
    }
  }
};

export const getDefinition = (type: string, key?: string): string => {
  const segmentDef = HL7_DEFINITIONS[type];
  if (!segmentDef) return "No description available for this segment.";
  
  if (key && segmentDef.fields && segmentDef.fields[key]) {
    return `${segmentDef.fields[key]} (${segmentDef.name} - ${key}): ${segmentDef.description}`;
  }
  
  return `${segmentDef.name}: ${segmentDef.description}`;
};
