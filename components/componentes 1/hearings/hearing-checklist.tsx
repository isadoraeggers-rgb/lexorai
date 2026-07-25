"use client";

import { useTransition } from "react";
import { toggleHearingChecklistItem } from "@/lib/actions/hearings";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { HearingChecklistItem } from "@/types/database.types";

export function HearingChecklist({
  hearingId,
  items,
}: {
  hearingId: string;
  items: HearingChecklistItem[];
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-secondary">
          <Checkbox
            checked={item.is_done}
            onCheckedChange={(checked) =>
              startTransition(() => toggleHearingChecklistItem(hearingId, item.id, Boolean(checked)))
            }
          />
          <span className={cn("text-sm", item.is_done && "text-muted-foreground line-through")}>
            {item.title}
          </span>
        </label>
      ))}
    </div>
  );
}
