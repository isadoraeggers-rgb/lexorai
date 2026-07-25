"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Building2, Scale, ShieldCheck, Loader2 } from "lucide-react";
import { updateOfficeBasics, updateLawyerBasics, completeOnboarding } from "@/lib/actions/onboarding";
import { createOabRegistration, toggleOabMonitored } from "@/lib/actions/oab";
import { maskOabNumber, formatOab } from "@/lib/validation/oab";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BRAZILIAN_STATES } from "@/types/database.types";
import type { Organization, Profile, OabRegistration } from "@/types/database.types";

const STEPS = [
  { key: "office", label: "Escritório", icon: Building2 },
  { key: "lawyer", label: "Seus dados", icon: Scale },
  { key: "monitoring", label: "Monitoramento", icon: ShieldCheck },
] as const;

export function OnboardingWizard({
  organization,
  profile,
  oabRegistrations,
}: {
  organization: Organization;
  profile: Profile;
  oabRegistrations: (OabRegistration & { lawyerName?: string })[];
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="p-8">
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-sm font-medium",
                  i < step
                    ? "border-accent bg-accent text-accent-foreground"
                    : i === step
                      ? "border-accent text-accent"
                      : "border-border text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-sm sm:inline", i === step ? "font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 0 && (
        <OfficeStep
          organization={organization}
          pending={pending}
          onSubmit={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await updateOfficeBasics(undefined, formData);
              if (result?.error) setError(result.error);
              else setStep(1);
            });
          }}
        />
      )}

      {step === 1 && (
        <LawyerStep
          profile={profile}
          pending={pending}
          onBack={() => setStep(0)}
          onSubmit={(formData) => {
            setError(null);
            startTransition(async () => {
              const lawyerResult = await updateLawyerBasics(undefined, formData);
              if (lawyerResult?.error) {
                setError(lawyerResult.error);
                return;
              }
              const oabResult = await createOabRegistration(undefined, formData);
              if (oabResult?.error) {
                setError(oabResult.error);
                return;
              }
              router.refresh();
              setStep(2);
            });
          }}
        />
      )}

      {step === 2 && (
        <MonitoringStep
          oabRegistrations={oabRegistrations}
          pending={pending}
          onBack={() => setStep(1)}
          onAddOab={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await createOabRegistration(undefined, formData);
              if (result?.error) setError(result.error);
              else router.refresh();
            });
          }}
          onToggleMonitored={(id, monitored) => {
            startTransition(() => toggleOabMonitored(id, monitored));
            router.refresh();
          }}
          onFinish={() => {
            setError(null);
            startTransition(async () => {
              const result = await completeOnboarding();
              if (result?.error) setError(result.error);
            });
          }}
        />
      )}
    </Card>
  );
}

function OfficeStep({
  organization,
  pending,
  onSubmit,
}: {
  organization: Organization;
  pending: boolean;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Sobre o escritório</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Essas informações aparecem no cabeçalho e nos documentos gerados pela Lexora.
      </p>
      <form
        action={(formData) => onSubmit(formData)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome do escritório</Label>
          <Input id="name" name="name" defaultValue={organization.name} required autoFocus />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail do escritório</Label>
            <Input id="email" name="email" type="email" defaultValue={organization.email ?? ""} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={organization.phone ?? ""} placeholder="(00) 0000-0000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logo">Logotipo do escritório</Label>
          <Input id="logo" name="logo" type="file" accept="image/*" />
          {organization.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={organization.logo_url} alt="Logo atual" className="mt-2 h-10 rounded" />
          )}
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function LawyerStep({
  profile,
  pending,
  onBack,
  onSubmit,
}: {
  profile: Profile;
  pending: boolean;
  onBack: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [oabNumber, setOabNumber] = useState("");

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Seus dados profissionais</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Precisamos da sua OAB para habilitar o monitoramento automático de prazos.
      </p>
      <form action={(formData) => onSubmit(formData)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name} required autoFocus />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={profile.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="(00) 00000-0000" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="oab_state">UF</Label>
            <Select name="oab_state" required>
              <SelectTrigger className="w-full" id="oab_state">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oab_number">Número da OAB</Label>
            <Input
              id="oab_number"
              name="oab_number"
              value={oabNumber}
              onChange={(e) => setOabNumber(maskOabNumber(e.target.value))}
              placeholder="49.412"
              required
            />
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
          <Checkbox name="is_monitored" defaultChecked />
          Monitorar automaticamente prazos e publicações desta OAB
        </label>
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MonitoringStep({
  oabRegistrations,
  pending,
  onBack,
  onAddOab,
  onToggleMonitored,
  onFinish,
}: {
  oabRegistrations: (OabRegistration & { lawyerName?: string })[];
  pending: boolean;
  onBack: () => void;
  onAddOab: (formData: FormData) => void;
  onToggleMonitored: (id: string, monitored: boolean) => void;
  onFinish: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [oabNumber, setOabNumber] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Monitoramento de prazos</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Selecione quais registros de OAB devem ser monitorados automaticamente. Você pode gerenciar mais
        advogados depois em Configurações → Equipe.
      </p>

      <div className="mb-4 flex flex-col gap-2">
        {oabRegistrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma OAB cadastrada ainda.</p>
        ) : (
          oabRegistrations.map((r) => (
            <label
              key={r.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
            >
              <Checkbox
                checked={r.is_monitored}
                onCheckedChange={(checked) => onToggleMonitored(r.id, Boolean(checked))}
              />
              <div className="flex-1">
                <p className="font-medium">{formatOab(r.oab_state, r.oab_number)}</p>
                {r.lawyerName && <p className="text-xs text-muted-foreground">{r.lawyerName}</p>}
              </div>
            </label>
          ))
        )}
      </div>

      {showAddForm ? (
        <form
          ref={formRef}
          action={(formData) => {
            onAddOab(formData);
            setShowAddForm(false);
            setOabNumber("");
          }}
          className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[100px_1fr_auto]"
        >
          <Select name="oab_state" required>
            <SelectTrigger id="add_oab_state">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {BRAZILIAN_STATES.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="oab_number"
            value={oabNumber}
            onChange={(e) => setOabNumber(maskOabNumber(e.target.value))}
            placeholder="Número da OAB"
            required
          />
          <input type="hidden" name="is_monitored" value="on" />
          <Button type="submit" disabled={pending}>
            Adicionar
          </Button>
        </form>
      ) : (
        <Button type="button" variant="outline" className="mb-4" onClick={() => setShowAddForm(true)}>
          + Adicionar outra OAB
        </Button>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" onClick={onFinish} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Check />}
          {pending ? "Concluindo..." : "Concluir configuração"}
        </Button>
      </div>
    </div>
  );
}
