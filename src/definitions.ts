export interface Definition {
  name: string;
  description: string;
  color?: string; // for segment badge coloring
  fields?: Record<string, FieldDefinition>;
}

export interface FieldDefinition {
  name: string;
  dataType?: string;
  description?: string;
  required?: boolean;
}

export interface DataTypeDefinition {
  name: string;
  components: Record<string, string>;
}

export const MESSAGE_TYPES: Record<string, string> = {
  ADT: "Admit, Discharge, Transfer — Patient demographic and visit information.",
  ORM: "Order Message — Transmit information about a health service order.",
  ORU: "Observation Result — Transmit laboratory results or clinical observations.",
  SIU: "Scheduling Information — Exchange scheduled appointment information.",
  VXU: "Vaccination Record — Transmit immunization information.",
  ACK: "General Acknowledgment — Acknowledge receipt of a message.",
  BAR: "Add/Change Billing Account — Billing account transactions.",
  DFT: "Detail Financial Transaction — Financial transaction details.",
  MFN: "Master Files Notification — Master file updates.",
  QRY: "Query — Request for information from another system.",
  RAS: "Pharmacy Administration — Pharmacy administration events.",
  RDE: "Pharmacy Encoded Order — Pharmacy order encoding.",
  RGV: "Pharmacy Give — Pharmacy administration events.",
  MDM: "Medical Document Management — Transcription and document management.",
  PPR: "Patient Problem — Patient problem tracking.",
};

export const MESSAGE_EVENTS: Record<string, string> = {
  A01: "Admit/Visit Notification",
  A02: "Transfer a Patient",
  A03: "Discharge/End Visit",
  A04: "Register a Patient",
  A05: "Pre-admit a Patient",
  A06: "Change an Outpatient to an Inpatient",
  A07: "Change an Inpatient to an Outpatient",
  A08: "Update Patient Information",
  A09: "Patient Departing - Tracking",
  A10: "Patient Arriving - Tracking",
  A11: "Cancel Admit/Visit Notification",
  A12: "Cancel Transfer",
  A13: "Cancel Discharge/End Visit",
  A14: "Pending Admit",
  A15: "Pending Transfer",
  A16: "Pending Discharge",
  A17: "Swap Patients",
  A18: "Merge Patient Information",
  A28: "Add Person Information",
  A31: "Update Person Information",
  A34: "Merge Patient Information - Patient ID Only",
  A40: "Merge Patient - Patient Identifier List",
  O01: "Order Message",
  O02: "Order Acknowledgment",
  R01: "Unsolicited Transmission of an Observation Message",
  S12: "New Appointment Booking",
  S13: "Appointment Rescheduling",
  S14: "Appointment Modification",
  S15: "Appointment Cancellation",
  V04: "Unsolicited Vaccination Record Update",
  T02: "Original Document Notification and Content",
  T04: "Document Status Change Notification and Content",
};

export const DATA_TYPES: Record<string, DataTypeDefinition> = {
  XPN: {
    name: "Extended Person Name",
    components: {
      "1": "Family Name (Surname)",
      "2": "Given Name (First Name)",
      "3": "Second/Further Names (Middle Name/Initial)",
      "4": "Suffix (e.g., JR, III)",
      "5": "Prefix (e.g., DR, MR, MS)",
      "6": "Degree (e.g., MD, PHD)",
      "7": "Name Type Code (L=Legal, D=Display, M=Maiden)",
    },
  },
  XAD: {
    name: "Extended Address",
    components: {
      "1": "Street Address",
      "2": "Other Designation (Apt, Suite)",
      "3": "City",
      "4": "State or Province",
      "5": "Zip or Postal Code",
      "6": "Country",
      "7": "Address Type (H=Home, B=Business, M=Mailing)",
    },
  },
  CWE: {
    name: "Coded with Exceptions",
    components: {
      "1": "Identifier (Code)",
      "2": "Text (Description)",
      "3": "Name of Coding System (e.g., LN, SCT, ICD10)",
      "4": "Alternate Identifier",
      "5": "Alternate Text",
      "6": "Name of Alternate Coding System",
      "7": "Coding System Version ID",
      "8": "Alternate Coding System Version ID",
      "9": "Original Text",
    },
  },
  XCN: {
    name: "Extended Composite ID Number and Name for Persons",
    components: {
      "1": "Person Identifier (ID Number)",
      "2": "Family Name",
      "3": "Given Name",
      "4": "Second and Further Given Names",
      "5": "Suffix (JR, III)",
      "6": "Prefix (DR, MR)",
      "7": "Degree (MD, PHD)",
      "8": "Source Table",
      "9": "Assigning Authority",
    },
  },
  CX: {
    name: "Extended Composite ID with Check Digit",
    components: {
      "1": "ID Number",
      "2": "Check Digit",
      "3": "Check Digit Scheme",
      "4": "Assigning Authority",
      "5": "Identifier Type Code (MR=Medical Record, SS=SSN)",
    },
  },
  MSG: {
    name: "Message Type",
    components: {
      "1": "Message Code (e.g., ADT, ORU)",
      "2": "Trigger Event (e.g., A01, R01)",
      "3": "Message Structure (e.g., ADT_A01)",
    },
  },
  PL: {
    name: "Person Location",
    components: {
      "1": "Point of Care (Nurse Unit)",
      "2": "Room",
      "3": "Bed",
      "4": "Facility",
      "5": "Location Status",
      "6": "Person Location Type",
      "7": "Building",
      "8": "Floor",
    },
  },
  NM: { name: "Numeric", components: { "1": "Numeric Value" } },
  ST: { name: "String", components: { "1": "String Data" } },
  DT: { name: "Date (YYYYMMDD)", components: { "1": "Date" } },
  DTM: { name: "Date/Time (YYYYMMDDHHMMSS)", components: { "1": "Date/Time" } },
  IS: { name: "Coded Value for HL7 Tables", components: { "1": "Code" } },
  ID: { name: "Coded Values for HL7 Tables", components: { "1": "Code" } },
};

export const SEGMENT_COLORS: Record<string, string> = {
  MSH: "#0ea5e9", // sky blue - header
  PID: "#10b981", // emerald - patient
  PV1: "#8b5cf6", // violet - visit
  OBX: "#f59e0b", // amber - observation
  ORC: "#ec4899", // pink - order common
  OBR: "#f97316", // orange - observation request
  NK1: "#14b8a6", // teal - next of kin
  AL1: "#ef4444", // red - allergy
  DG1: "#6366f1", // indigo - diagnosis
  EVN: "#84cc16", // lime - event
  MSA: "#22d3ee", // cyan - ack
  IN1: "#a78bfa", // light violet - insurance
  GT1: "#fb923c", // light orange - guarantor
  ZPD: "#94a3b8", // slate - custom Z segment
};

export const HL7_DEFINITIONS: Record<string, Definition> = {
  MSH: {
    name: "Message Header",
    color: "#0ea5e9",
    description:
      "The MSH segment defines the intent, source, destination, and some specifics of the syntax of a message. It is always the first segment in an HL7 message.",
    fields: {
      "1": { name: "Field Separator", required: true },
      "2": { name: "Encoding Characters", required: true },
      "3": { name: "Sending Application", dataType: "HD" },
      "4": { name: "Sending Facility", dataType: "HD" },
      "5": { name: "Receiving Application", dataType: "HD" },
      "6": { name: "Receiving Facility", dataType: "HD" },
      "7": { name: "Date/Time of Message", dataType: "DTM" },
      "8": { name: "Security" },
      "9": { name: "Message Type", dataType: "MSG", required: true },
      "10": { name: "Message Control ID", required: true },
      "11": { name: "Processing ID", required: true },
      "12": { name: "Version ID", required: true },
      "13": { name: "Sequence Number" },
      "14": { name: "Continuation Pointer" },
      "15": { name: "Accept Acknowledgment Type" },
      "16": { name: "Application Acknowledgment Type" },
      "17": { name: "Country Code" },
      "18": { name: "Character Set" },
      "19": { name: "Principal Language of Message" },
    },
  },

  EVN: {
    name: "Event Type",
    color: "#84cc16",
    description:
      "The EVN segment is used to communicate necessary trigger event information to receiving applications. It identifies the type of event that generated the message.",
    fields: {
      "1": { name: "Event Type Code" },
      "2": { name: "Recorded Date/Time", dataType: "DTM", required: true },
      "3": { name: "Date/Time Planned Event", dataType: "DTM" },
      "4": { name: "Event Reason Code" },
      "5": { name: "Operator ID", dataType: "XCN" },
      "6": { name: "Event Occurred", dataType: "DTM" },
      "7": { name: "Event Facility" },
    },
  },

  MSA: {
    name: "Message Acknowledgment",
    color: "#22d3ee",
    description:
      "The MSA segment contains information sent while acknowledging another message. It is found in ACK messages and other acknowledgment responses.",
    fields: {
      "1": { name: "Acknowledgment Code", required: true, description: "AA=Application Accept, AE=Application Error, AR=Application Reject" },
      "2": { name: "Message Control ID", required: true },
      "3": { name: "Text Message" },
      "4": { name: "Expected Sequence Number" },
      "6": { name: "Error Condition", dataType: "CWE" },
    },
  },

  PID: {
    name: "Patient Identification",
    color: "#10b981",
    description:
      "The PID segment is used by all applications as the primary means of communicating patient identification information. It contains the core demographics for the patient.",
    fields: {
      "1": { name: "Set ID" },
      "2": { name: "Patient ID (External)" },
      "3": { name: "Patient Identifier List", dataType: "CX", required: true },
      "4": { name: "Alternate Patient ID" },
      "5": { name: "Patient Name", dataType: "XPN", required: true },
      "6": { name: "Mother's Maiden Name", dataType: "XPN" },
      "7": { name: "Date/Time of Birth", dataType: "DT" },
      "8": { name: "Administrative Sex", description: "M=Male, F=Female, O=Other, U=Unknown, A=Ambiguous, N=Not Applicable" },
      "9": { name: "Patient Alias", dataType: "XPN" },
      "10": { name: "Race", dataType: "CWE" },
      "11": { name: "Patient Address", dataType: "XAD" },
      "12": { name: "County Code" },
      "13": { name: "Phone Number - Home" },
      "14": { name: "Phone Number - Business" },
      "15": { name: "Primary Language", dataType: "CWE" },
      "16": { name: "Marital Status", dataType: "CWE" },
      "17": { name: "Religion", dataType: "CWE" },
      "18": { name: "Patient Account Number", dataType: "CX" },
      "19": { name: "SSN Number - Patient" },
      "20": { name: "Driver's License Number" },
      "22": { name: "Ethnic Group", dataType: "CWE" },
      "23": { name: "Birth Place" },
      "24": { name: "Multiple Birth Indicator" },
      "25": { name: "Birth Order" },
      "29": { name: "Patient Death Date and Time", dataType: "DTM" },
      "30": { name: "Patient Death Indicator" },
    },
  },

  PV1: {
    name: "Patient Visit",
    color: "#8b5cf6",
    description:
      "The PV1 segment is used by registration/ADT applications to communicate information on an account or visit-specific basis. It describes the patient's current visit context.",
    fields: {
      "1": { name: "Set ID" },
      "2": { name: "Patient Class", required: true, description: "E=Emergency, I=Inpatient, O=Outpatient, P=Preadmit, R=Recurring, B=Obstetrics" },
      "3": { name: "Assigned Patient Location", dataType: "PL" },
      "4": { name: "Admission Type", description: "A=Accident, E=Emergency, L=Labor and Delivery, R=Routine" },
      "5": { name: "Preadmit Number" },
      "6": { name: "Prior Patient Location", dataType: "PL" },
      "7": { name: "Attending Doctor", dataType: "XCN" },
      "8": { name: "Referring Doctor", dataType: "XCN" },
      "9": { name: "Consulting Doctor", dataType: "XCN" },
      "10": { name: "Hospital Service" },
      "11": { name: "Temporary Location" },
      "14": { name: "Admit Source" },
      "15": { name: "Ambulatory Status" },
      "16": { name: "VIP Indicator" },
      "17": { name: "Admitting Doctor", dataType: "XCN" },
      "18": { name: "Patient Type" },
      "19": { name: "Visit Number", dataType: "CX" },
      "20": { name: "Financial Class" },
      "36": { name: "Discharge Disposition" },
      "44": { name: "Admit Date/Time", dataType: "DTM" },
      "45": { name: "Discharge Date/Time", dataType: "DTM" },
    },
  },

  NK1: {
    name: "Next of Kin / Associated Parties",
    color: "#14b8a6",
    description:
      "The NK1 segment contains information about the patient's other related parties. Any associated parties may be identified, including next of kin, insurance company, state agency, federal agency, etc.",
    fields: {
      "1": { name: "Set ID", required: true },
      "2": { name: "Name", dataType: "XPN" },
      "3": { name: "Relationship", dataType: "CWE" },
      "4": { name: "Address", dataType: "XAD" },
      "5": { name: "Phone Number" },
      "6": { name: "Business Phone Number" },
      "7": { name: "Contact Role", dataType: "CWE" },
      "8": { name: "Start Date", dataType: "DT" },
      "9": { name: "End Date", dataType: "DT" },
      "13": { name: "Organization Name" },
      "15": { name: "Administrative Sex" },
      "16": { name: "Date/Time of Birth", dataType: "DTM" },
    },
  },

  AL1: {
    name: "Patient Allergy Information",
    color: "#ef4444",
    description:
      "The AL1 segment contains patient allergy information of various types. Each AL1 segment describes a single allergy for the patient.",
    fields: {
      "1": { name: "Set ID", required: true },
      "2": { name: "Allergen Type Code", dataType: "CWE", description: "DA=Drug Allergy, FA=Food Allergy, MA=Miscellaneous Allergy, MC=Miscellaneous Contraindication" },
      "3": { name: "Allergen Code/Mnemonic/Description", dataType: "CWE", required: true },
      "4": { name: "Allergy Severity Code", dataType: "CWE", description: "SV=Severe, MO=Moderate, MI=Mild, U=Unknown" },
      "5": { name: "Allergy Reaction Code" },
      "6": { name: "Identification Date", dataType: "DT" },
    },
  },

  DG1: {
    name: "Diagnosis",
    color: "#6366f1",
    description:
      "The DG1 segment contains patient diagnosis information of various types. This segment can be used to send multiple diagnoses (e.g. primary, secondary, etc.).",
    fields: {
      "1": { name: "Set ID", required: true },
      "2": { name: "Diagnosis Coding Method" },
      "3": { name: "Diagnosis Code", dataType: "CWE", required: true, description: "Coded diagnosis (e.g., ICD-10 code)" },
      "4": { name: "Diagnosis Description" },
      "5": { name: "Diagnosis Date/Time", dataType: "DTM" },
      "6": { name: "Diagnosis Type", description: "A=Admitting, W=Working, F=Final" },
      "7": { name: "Major Diagnostic Category" },
      "15": { name: "Diagnosis Priority", description: "1=Primary, 2=Secondary, etc." },
      "16": { name: "Diagnosing Clinician", dataType: "XCN" },
    },
  },

  ORC: {
    name: "Common Order",
    color: "#ec4899",
    description:
      "The ORC segment contains common information about an order and is required in all orders. It links the order with the request, the actual results, and the placer and filler.",
    fields: {
      "1": { name: "Order Control", required: true, description: "NW=New Order, CA=Cancel Order, DC=Discontinue, HD=Hold Order, RL=Release, XO=Change Order" },
      "2": { name: "Placer Order Number", dataType: "EI" },
      "3": { name: "Filler Order Number", dataType: "EI" },
      "4": { name: "Placer Group Number" },
      "5": { name: "Order Status", description: "A=Some segments received, CA=Order cancelled, CM=Order is completed, DC=Order discontinued" },
      "9": { name: "Date/Time of Transaction", dataType: "DTM" },
      "10": { name: "Entered By", dataType: "XCN" },
      "12": { name: "Ordering Provider", dataType: "XCN" },
      "13": { name: "Enterer's Location", dataType: "PL" },
      "14": { name: "Call Back Phone Number" },
      "15": { name: "Order Effective Date/Time", dataType: "DTM" },
      "16": { name: "Order Control Code Reason", dataType: "CWE" },
      "17": { name: "Entering Organization", dataType: "CWE" },
      "21": { name: "Ordering Facility Name" },
      "22": { name: "Ordering Facility Address" },
    },
  },

  OBR: {
    name: "Observation Request",
    color: "#f97316",
    description:
      "The OBR segment is used to transmit information specific to an order for a diagnostic study or observation, physical exam, or assessment.",
    fields: {
      "1": { name: "Set ID" },
      "2": { name: "Placer Order Number" },
      "3": { name: "Filler Order Number" },
      "4": { name: "Universal Service Identifier", dataType: "CWE", required: true },
      "5": { name: "Priority", description: "S=Stat, R=Routine, P=Pre-op, C=Callback, T=Timing Critical" },
      "6": { name: "Requested Date/Time", dataType: "DTM" },
      "7": { name: "Observation Date/Time", dataType: "DTM" },
      "8": { name: "Observation End Date/Time", dataType: "DTM" },
      "10": { name: "Collector Identifier", dataType: "XCN" },
      "11": { name: "Specimen Action Code" },
      "14": { name: "Specimen Received Date/Time", dataType: "DTM" },
      "16": { name: "Ordering Provider", dataType: "XCN" },
      "22": { name: "Results Report/Status Change Date/Time", dataType: "DTM" },
      "25": { name: "Result Status", description: "F=Final, P=Preliminary, C=Corrected, X=No Results" },
    },
  },

  OBX: {
    name: "Observation / Result",
    color: "#f59e0b",
    description:
      "The OBX segment is used to transmit a single observation or observation fragment. Each OBX segment contains one observation value with its associated metadata.",
    fields: {
      "1": { name: "Set ID" },
      "2": { name: "Value Type", required: true, description: "NM=Numeric, ST=String, CWE=Coded, DT=Date, TM=Time, TX=Text, FT=Formatted Text" },
      "3": { name: "Observation Identifier", dataType: "CWE", required: true },
      "4": { name: "Observation Sub-ID" },
      "5": { name: "Observation Value", required: true },
      "6": { name: "Units", dataType: "CWE" },
      "7": { name: "References Range" },
      "8": { name: "Interpretation Codes", description: "H=High, L=Low, N=Normal, A=Abnormal, C=Critical" },
      "9": { name: "Probability" },
      "10": { name: "Nature of Abnormal Test" },
      "11": { name: "Observation Result Status", required: true, description: "F=Final, P=Preliminary, C=Corrected, D=Deleted, W=Post Original" },
      "14": { name: "Date/Time of Observation", dataType: "DTM" },
      "15": { name: "Producer's ID" },
      "16": { name: "Responsible Observer", dataType: "XCN" },
    },
  },

  IN1: {
    name: "Insurance",
    color: "#a78bfa",
    description:
      "The IN1 segment contains insurance policy coverage information necessary to produce properly-billed claims.",
    fields: {
      "1": { name: "Set ID", required: true },
      "2": { name: "Insurance Plan ID", dataType: "CWE", required: true },
      "3": { name: "Insurance Company ID", required: true },
      "4": { name: "Insurance Company Name" },
      "5": { name: "Insurance Company Address", dataType: "XAD" },
      "6": { name: "Insurance Co Contact Person" },
      "7": { name: "Insurance Co Phone Number" },
      "10": { name: "Group Number" },
      "11": { name: "Group Name" },
      "12": { name: "Insured's Group Emp ID" },
      "15": { name: "Plan Type" },
      "16": { name: "Name of Insured", dataType: "XPN" },
      "17": { name: "Insured's Relationship to Patient", dataType: "CWE" },
      "18": { name: "Insured's Date of Birth", dataType: "DTM" },
      "35": { name: "Company Plan Code" },
      "36": { name: "Policy Number" },
      "46": { name: "Policy Deductible" },
      "47": { name: "Policy Limit - Amount" },
    },
  },

  GT1: {
    name: "Guarantor",
    color: "#fb923c",
    description:
      "The GT1 segment contains guarantor (e.g. the person or organization responsible for payment of a patient's account) data for patient and insurance billing applications.",
    fields: {
      "1": { name: "Set ID", required: true },
      "2": { name: "Guarantor Number", dataType: "CX" },
      "3": { name: "Guarantor Name", dataType: "XPN", required: true },
      "4": { name: "Guarantor Spouse Name", dataType: "XPN" },
      "5": { name: "Guarantor Address", dataType: "XAD" },
      "6": { name: "Guarantor Ph Num - Home" },
      "7": { name: "Guarantor Ph Num - Business" },
      "8": { name: "Guarantor Date/Time of Birth", dataType: "DTM" },
      "9": { name: "Guarantor Administrative Sex" },
      "10": { name: "Guarantor Type" },
      "11": { name: "Guarantor Relationship", dataType: "CWE" },
      "12": { name: "Guarantor SSN" },
    },
  },
};
