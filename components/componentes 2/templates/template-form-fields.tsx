import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Template } from "@/types/database.types";

export function TemplateFormFields({ template }: { template?: Template }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={template?.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category" defaultValue={template?.category ?? "petition"}>
            <SelectTrigger className="w-full" id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petition">Petição</SelectItem>
              <SelectItem value="appeal">Recurso</SelectItem>
              <SelectItem value="contract">Contrato</SelectItem>
              <SelectItem value="notification">Notificação</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="checklist">Checklist</SelectItem>
              <SelectItem value="report">Relatório</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" defaultValue={template?.description ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="content">
          Conteúdo <span className="text-muted-foreground">(use {"{{variavel}}"} para placeholders)</span>
        </Label>
        <Textarea id="content" name="content" rows={16} className="font-mono text-sm" defaultValue={template?.content} required />
      </div>
    </div>
  );
}
