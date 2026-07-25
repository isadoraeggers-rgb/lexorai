import { z } from "zod";

export const processSchema = z.object({
  number: z.string().min(3, "Informe o número do processo"),
  court: z.string().optional().or(z.literal("")),
  judge: z.string().optional().or(z.literal("")),
  class: z.string().optional().or(z.literal("")),
  subject: z.string().optional().or(z.literal("")),
  opposing_party: z.string().optional().or(z.literal("")),
  lawyer_id: z.string().optional().or(z.literal("")),
  responsible_user_id: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "suspended", "archived", "won", "lost", "settled"]),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  case_value: z.string().optional().or(z.literal("")),
  distribution_date: z.string().optional().or(z.literal("")),
  client_id: z.string().optional().or(z.literal("")),
});

export type ProcessFormValues = z.infer<typeof processSchema>;
