/**
 * Hand-maintained mirror of the Supabase schema (supabase/migrations/*.sql).
 * Once the project is linked, replace this file by running:
 *   supabase gen types typescript --linked > src/types/database.types.ts
 */

export type UserRole = "owner" | "admin" | "lawyer" | "paralegal" | "financial" | "viewer";
export type ClientType = "individual" | "company";
export type ProcessStatus = "active" | "suspended" | "archived" | "won" | "lost" | "settled";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PriorityLevel = "low" | "medium" | "high" | "urgent";
export type ProcessPartyRole = "client" | "co_party" | "third_party";
export type DeadlineStatus = "upcoming" | "completed" | "late";
export type ReminderFrequency = "none" | "daily" | "weekly" | "monthly";
export type HearingLocationType = "in_person" | "online" | "hybrid";
export type HearingStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";
export type TaskStatus = "todo" | "doing" | "waiting" | "done";
export type DocumentFileType = "pdf" | "docx" | "xlsx" | "image" | "other";
export type TemplateCategory =
  | "petition"
  | "appeal"
  | "contract"
  | "notification"
  | "email"
  | "checklist"
  | "report";
export type MemoryType =
  | "decision"
  | "strategy"
  | "note"
  | "hearing_record"
  | "ai_conversation"
  | "process_summary"
  | "client_preference"
  | "procedural_history"
  | "jurisprudence"
  | "doctrine";
export type AiAgentType =
  | "assistant"
  | "controladoria"
  | "petition_writer"
  | "case_analyst"
  | "document_reviewer"
  | "office_manager";
export type AiMessageRole = "user" | "assistant" | "system";
export type NotificationChannel = "in_app" | "email" | "whatsapp" | "push";
export type NotificationType =
  | "deadline_due"
  | "hearing_reminder"
  | "task_assigned"
  | "document_uploaded"
  | "process_updated"
  | "ai_summary_ready"
  | "mention"
  | "system";
export type ReportType = "productivity" | "cases" | "financial" | "deadlines" | "hearings";
export type NotionEntityType = "process" | "client" | "hearing" | "deadline" | "task" | "wiki_page";
export type PublicationStatus = "pending" | "processed" | "dismissed";
export type DeadlineOrigin = "manual" | "auto_monitoring";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string;
  oab_registration: string | null;
  phone: string | null;
  email: string | null;
  onboarding_completed_at: string | null;
  address: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
export type BrazilianState = (typeof BRAZILIAN_STATES)[number];

export type OabRegistration = {
  id: string;
  organization_id: string;
  profile_id: string | null;
  oab_number: string;
  oab_state: string;
  practice_areas: string[];
  is_active: boolean;
  is_monitored: boolean;
  created_at: string;
  updated_at: string;
};

export type MonitoredPublication = {
  id: string;
  organization_id: string;
  oab_registration_id: string | null;
  process_number: string | null;
  court: string | null;
  publication_date: string | null;
  raw_text: string;
  status: PublicationStatus;
  detected_deadline_id: string | null;
  created_at: string;
};

export type DeadlineMonitoringStatus = {
  organization_id: string;
  monitoring_enabled: boolean;
};

export type Profile = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  oab_number: string | null;
  phone: string | null;
  title: string | null;
  is_active: boolean;
  pinned_process_ids: string[];
  favorite_client_ids: string[];
  notification_prefs: { email: boolean; push: boolean; whatsapp: boolean; in_app: boolean };
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  organization_id: string;
  type: ClientType;
  name: string;
  cpf: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  notes: string | null;
  tags: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientTimelineEvent = {
  id: string;
  organization_id: string;
  client_id: string;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

export type Process = {
  id: string;
  organization_id: string;
  number: string;
  court: string | null;
  judge: string | null;
  class: string | null;
  subject: string | null;
  opposing_party: string | null;
  lawyer_id: string | null;
  responsible_user_id: string | null;
  status: ProcessStatus;
  risk_level: RiskLevel;
  priority: PriorityLevel;
  case_value: number | null;
  ai_summary: string | null;
  ai_summary_updated_at: string | null;
  distribution_date: string | null;
  last_movement_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProcessClient = {
  process_id: string;
  client_id: string;
  role: ProcessPartyRole;
};

export type ProcessTimelineEvent = {
  id: string;
  organization_id: string;
  process_id: string;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

export type Deadline = {
  id: string;
  organization_id: string;
  process_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  status: DeadlineStatus;
  priority: PriorityLevel;
  reminder_frequency: ReminderFrequency;
  responsible_user_id: string | null;
  completed_at: string | null;
  completed_by: string | null;
  origin: DeadlineOrigin;
  source_publication_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Hearing = {
  id: string;
  organization_id: string;
  process_id: string | null;
  title: string;
  hearing_type: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location_type: HearingLocationType;
  address: string | null;
  meet_url: string | null;
  judge: string | null;
  status: HearingStatus;
  notes: string | null;
  ai_prep_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HearingParticipant = {
  id: string;
  hearing_id: string;
  name: string;
  role: string | null;
  email: string | null;
  confirmed: boolean;
};

export type HearingChecklistItem = {
  id: string;
  hearing_id: string;
  title: string;
  is_done: boolean;
  order_index: number;
};

export type HearingAttachment = {
  id: string;
  hearing_id: string;
  document_id: string | null;
  file_name: string;
  file_path: string;
  uploaded_by: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  organization_id: string;
  process_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
};

export type DocumentFolder = {
  id: string;
  organization_id: string;
  parent_id: string | null;
  process_id: string | null;
  client_id: string | null;
  name: string;
  created_by: string | null;
  created_at: string;
};

export type Tag = {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Document = {
  id: string;
  organization_id: string;
  folder_id: string | null;
  process_id: string | null;
  client_id: string | null;
  name: string;
  file_path: string;
  file_type: DocumentFileType;
  mime_type: string | null;
  size_bytes: number;
  ocr_ready: boolean;
  ocr_text: string | null;
  current_version: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Template = {
  id: string;
  organization_id: string;
  name: string;
  category: TemplateCategory;
  description: string | null;
  content: string;
  variables: { key: string; label: string }[];
  usage_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SecondBrainMemory = {
  id: string;
  organization_id: string;
  type: MemoryType;
  title: string;
  content: string;
  process_id: string | null;
  client_id: string | null;
  source: string | null;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AiChat = {
  id: string;
  organization_id: string;
  user_id: string | null;
  agent_type: AiAgentType;
  title: string;
  process_id: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AiAgentRun = {
  id: string;
  organization_id: string;
  agent_type: AiAgentType;
  summary: string;
  details: Record<string, unknown>;
  process_id: string | null;
  created_at: string;
};

export type AiMessage = {
  id: string;
  chat_id: string;
  role: AiMessageRole;
  content: string;
  tool_calls: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Notification = {
  id: string;
  organization_id: string;
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  organization_id: string;
  process_id: string | null;
  client_id: string | null;
  hearing_id: string | null;
  author_id: string | null;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type NotionSyncLink = {
  id: string;
  organization_id: string;
  entity_type: NotionEntityType;
  entity_id: string | null;
  notion_page_id: string;
  notion_database_id: string | null;
  last_synced_at: string | null;
  last_synced_hash: string | null;
  sync_direction: string;
  created_at: string;
};

export type NotionWorkspace = {
  organization_id: string;
  access_token_encrypted: string | null;
  workspace_name: string | null;
  database_map: Partial<Record<NotionEntityType, string>>;
  last_full_sync_at: string | null;
  created_at: string;
};

export type Report = {
  id: string;
  organization_id: string;
  type: ReportType;
  title: string;
  period_start: string;
  period_end: string;
  data: Record<string, unknown>;
  generated_by: string | null;
  created_at: string;
};

export type ControlCenterSnapshot = {
  organization_id: string;
  processes_without_movement: number;
  late_deadlines: number;
  hearings_this_week: number;
  tasks_overdue: number;
  documents_missing_ocr: number;
  active_clients: number;
};

type TableDef<Row> = {
  Row: Row;
  // Hand-maintained stub: every column is optional on insert since we can't
  // express per-column DB defaults/nullability here. Replace with
  // `supabase gen types` once the project is linked for precise Insert types.
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      organizations: TableDef<Organization>;
      profiles: TableDef<Profile>;
      clients: TableDef<Client>;
      client_timeline_events: TableDef<ClientTimelineEvent>;
      processes: TableDef<Process>;
      process_clients: TableDef<ProcessClient>;
      process_timeline_events: TableDef<ProcessTimelineEvent>;
      deadlines: TableDef<Deadline>;
      hearings: TableDef<Hearing>;
      hearing_participants: TableDef<HearingParticipant>;
      hearing_checklist_items: TableDef<HearingChecklistItem>;
      hearing_attachments: TableDef<HearingAttachment>;
      tasks: TableDef<Task>;
      task_comments: TableDef<TaskComment>;
      document_folders: TableDef<DocumentFolder>;
      tags: TableDef<Tag>;
      documents: TableDef<Document>;
      templates: TableDef<Template>;
      second_brain_memories: TableDef<SecondBrainMemory>;
      ai_chats: TableDef<AiChat>;
      ai_messages: TableDef<AiMessage>;
      ai_agent_runs: TableDef<AiAgentRun>;
      notifications: TableDef<Notification>;
      notes: TableDef<Note>;
      notion_sync_links: TableDef<NotionSyncLink>;
      notion_workspaces: TableDef<NotionWorkspace>;
      reports: TableDef<Report>;
      oab_registrations: TableDef<OabRegistration>;
      monitored_publications: TableDef<MonitoredPublication>;
    };
    Views: {
      control_center_snapshot: {
        Row: ControlCenterSnapshot;
        Relationships: [];
      };
      deadline_monitoring_status: {
        Row: DeadlineMonitoringStatus;
        Relationships: [];
      };
    };
    Functions: {
      match_second_brain_memories: {
        Args: {
          query_embedding: number[];
          match_count?: number;
          filter_type?: MemoryType | null;
          filter_process_id?: string | null;
          filter_client_id?: string | null;
        };
        Returns: {
          id: string;
          type: MemoryType;
          title: string;
          content: string;
          process_id: string | null;
          client_id: string | null;
          similarity: number;
          created_at: string;
        }[];
      };
    };
  };
}
