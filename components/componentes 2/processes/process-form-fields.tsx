import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Process } from "@/types/database.types";

type TeamMember = { id: string; full_name: string };
type ClientOption = { id: string; name: string };

export function ProcessFormFields({
  process,
  team,
  clients,
}: {
  process?: Process;
  team: TeamMember[];
  clients: ClientOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="number">Número do processo</Label>
        <Input id="number" name="number" defaultValue={process?.number} placeholder="0000000-00.0000.0.00.0000" required />
      </div>

      {!process && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="client_id">Cliente</Label>
          <Select name="client_id">
            <SelectTrigger className="w-full" id="client_id">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="court">Vara / Tribunal</Label>
        <Input id="court" name="court" defaultValue={process?.court ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="judge">Juiz</Label>
        <Input id="judge" name="judge" defaultValue={process?.judge ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="class">Classe</Label>
        <Input id="class" name="class" defaultValue={process?.class ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="opposing_party">Parte contrária</Label>
        <Input id="opposing_party" name="opposing_party" defaultValue={process?.opposing_party ?? ""} />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="subject">Assunto</Label>
        <Input id="subject" name="subject" defaultValue={process?.subject ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lawyer_id">Advogado</Label>
        <Select name="lawyer_id" defaultValue={process?.lawyer_id ?? undefined}>
          <SelectTrigger className="w-full" id="lawyer_id">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {team.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="responsible_user_id">Responsável</Label>
        <Select name="responsible_user_id" defaultValue={process?.responsible_user_id ?? undefined}>
          <SelectTrigger className="w-full" id="responsible_user_id">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {team.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={process?.status ?? "active"}>
          <SelectTrigger className="w-full" id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="suspended">Suspenso</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
            <SelectItem value="won">Ganho</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
            <SelectItem value="settled">Acordo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="priority">Prioridade</Label>
        <Select name="priority" defaultValue={process?.priority ?? "medium"}>
          <SelectTrigger className="w-full" id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="risk_level">Nível de risco</Label>
        <Select name="risk_level" defaultValue={process?.risk_level ?? "medium"}>
          <SelectTrigger className="w-full" id="risk_level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixo</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="case_value">Valor da causa (R$)</Label>
        <Input id="case_value" name="case_value" type="number" step="0.01" defaultValue={process?.case_value ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="distribution_date">Data de distribuição</Label>
        <Input
          id="distribution_date"
          name="distribution_date"
          type="date"
          defaultValue={process?.distribution_date ?? ""}
        />
      </div>
    </div>
  );
}
