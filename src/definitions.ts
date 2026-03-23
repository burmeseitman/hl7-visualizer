export interface Definition {
  name: string;
  description: string;
  fields?: Record<string, FieldDefinition>;
}

export interface FieldDefinition {
  name: string;
  dataType?: string;
  description?: string;
}

export interface DataTypeDefinition {
  name: string;
  components: Record<string, string>;
}

export const MESSAGE_TYPES: Record<string, string> = {
  "ADT": "Admit, Discharge, Transfer - Used to exchange patient demographic and visit information.",
  "ORM": "Order Message - Used to transmit information about a health service order.",
  "ORU": "Observation Result - Used to transmit laboratory results or other clinical observations.",
  "SIU": "Scheduling Information - Used to exchange information about scheduled appointments.",
  "VXU": "Vaccination Record - Used to transmit immunization information.",
  "ACK": "General Acknowledgment - Used to acknowledge receipt of a message."
};

export const MESSAGE_EVENTS: Record<string, string> = {
  "A01": "Admit/Visit Notification",
  "A03": "Discharge/End Visit",
  "A04": "Register a Patient",
  "A08": "Update Patient Information",
  "O01": "Order Message",
  "R01": "Unsolicited Transmission of an Observation Message",
  "S12": "New Appointment Booking",
  "V04": "Unsolicited Vaccination Record Update"
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
      "7": "Name Type Code (L=Legal, D=Display, M=Maiden)"
    }
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
      "7": "Address Type (H=Home, B=Business)"
    }
  },
  CWE: {
    name: "Coded with Exceptions",
    components: {
      "1": "Identifier (Code)",
      "2": "Text (Description)",
      "3": "Name of Coding System (e.g., LN, SCT)",
      "4": "Alternate Identifier",
      "5": "Alternate Text",
      "6": "Name of Alternate Coding System"
    }
  }
};

export const HL7_DEFINITIONS: Record<string, Definition> = {
  MSH: {
    name: "Message Header",
    description: "The MSH segment contains information about the message itself, such as sender, receiver, message type, and version.",
    fields: {
      "1": { name: "Field Separator" },
      "2": { name: "Encoding Characters" },
      "3": { name: "Sending Application" },
      "4": { name: "Sending Facility" },
      "5": { name: "Receiving Application" },
      "6": { name: "Receiving Facility" },
      "7": { name: "Date/Time of Message" },
      "9": { name: "Message Type", dataType: "MSG" },
      "10": { name: "Message Control ID" },
      "11": { name: "Processing ID" },
      "12": { name: "Version ID" }
    }
  },
  PID: {
    name: "Patient Identification",
    description: "The PID segment is used by all applications as the primary method of addressing the patient for an event.",
    fields: {
      "1": { name: "Set ID - PID" },
      "3": { name: "Patient Identifier List" },
      "5": { name: "Patient Name", dataType: "XPN" },
      "7": { name: "Date/Time of Birth" },
      "8": { name: "Administrative Sex" },
      "11": { name: "Patient Address", dataType: "XAD" },
      "13": { name: "Phone Number - Home" },
      "18": { name: "Patient Account Number" }
    }
  },
  PV1: {
    name: "Patient Visit",
    description: "The PV1 segment is used by registration applications to communicate information on an account or visit-specific basis.",
    fields: {
      "2": { name: "Patient Class" },
      "3": { name: "Assigned Patient Location" },
      "7": { name: "Attending Doctor", dataType: "XCN" },
      "19": { name: "Visit Number" },
      "44": { name: "Admit Date/Time" }
    }
  },
  OBX: {
    name: "Observation/Result",
    description: "The OBX segment is used to transmit a single observation or observation fragment.",
    fields: {
      "2": { name: "Value Type" },
      "3": { name: "Observation Identifier", dataType: "CWE" },
      "5": { name: "Observation Value" },
      "6": { name: "Units", dataType: "CWE" },
      "11": { name: "Observation Result Status" }
    }
  }
};
