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
import type { Client } from "@/types/database.types";

export function ClientFormFields({ client }: { client?: Client }) {
  const address = (client?.address ?? {}) as Record<string, string>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="type">Tipo de cliente</Label>
        <Select name="type" defaultValue={client?.type ?? "individual"}>
          <SelectTrigger className="w-full" id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Pessoa física</SelectItem>
            <SelectItem value="company">Pessoa jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="name">Nome completo / Razão social</Label>
        <Input id="name" name="name" defaultValue={client?.name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" name="cpf" defaultValue={client?.cpf ?? ""} placeholder="000.000.000-00" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input id="cnpj" name="cnpj" defaultValue={client?.cnpj ?? ""} placeholder="00.000.000/0000-00" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} placeholder="(00) 00000-0000" />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="street">Endereço</Label>
        <Input id="street" name="street" defaultValue={address.street ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="city">Cidade</Label>
        <Input id="city" name="city" defaultValue={address.city ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="state">Estado</Label>
        <Input id="state" name="state" defaultValue={address.state ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="zip">CEP</Label>
        <Input id="zip" name="zip" defaultValue={address.zip ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input id="tags" name="tags" defaultValue={client?.tags?.join(", ") ?? ""} placeholder="VIP, Trabalhista" />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={client?.notes ?? ""} />
      </div>
    </div>
  );
}
