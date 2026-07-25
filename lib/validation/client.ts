import { z } from "zod";

export const clientSchema = z.object({
  type: z.enum(["individual", "company"]),
  name: z.string().min(2, "Informe o nome completo"),
  cpf: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
