"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleOabActive, toggleOabMonitored, deleteOabRegistration } from "@/lib/actions/oab";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatOab } from "@/lib/validation/oab";
import type { OabRegistration } from "@/types/database.types";

export function OabRegistrationRow({
  registration,
}: {
  registration: OabRegistration & { lawyerName?: string };
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-none">
      <div className="min-w-[180px] flex-1">
        <p className="text-sm font-medium">{formatOab(registration.oab_state, registration.oab_number)}</p>
        <p className="text-xs text-muted-foreground">{registration.lawyerName ?? "Sem advogado vinculado"}</p>
        {registration.practice_areas.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {registration.practice_areas.map((area) => (
              <Badge key={area} variant="secondary">
                {area}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Ativa</span>
        <Switch
          checked={registration.is_active}
          onCheckedChange={(checked) => startTransition(() => toggleOabActive(registration.id, checked))}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Monitorar</span>
        <Switch
          checked={registration.is_monitored}
          disabled={!registration.is_active}
          onCheckedChange={(checked) => startTransition(() => toggleOabMonitored(registration.id, checked))}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => startTransition(() => deleteOabRegistration(registration.id))}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
