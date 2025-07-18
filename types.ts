export interface FollowUpData {
  leadId: string;
  personName: string;
  mobile: number | null;
  state: string;
  requirement: string;
  salesPerson: string;
  stepName: string;
  stepCode: string;
  daysOfFollowUp: number | null;
  numberOfFollowUps: number | null;
  planned: string;
  actual: string;
  lastStatus: string;
  link: string;
  scEmail: string;
  doer: string;
  remark: string;
  lastPlannedDcDoor: string;
}

export interface UserPermission {
  userType: string;
  email: string;
  name: string;
}

export interface PerformanceData {
  scEmail: string;
  sc: string;
  leadsAssign: number;
  callsMade: number;
  meetingFixed: number;
  onFollowUps: number;
  followUpsDone: number;
}

export interface HelpTicket {
  ticketId: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  issue: string;
  screenshotLink: string;
  status: 'Pending' | 'Resolved' | 'Cancelled by User' | 'Cancelled by Dev';
  lastUpdated: string;
  resolvedBy: string;
}
