"use client";

import { FileDown, Sheet as SheetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToPdf, exportToExcel } from "@/lib/export/export-utils";

export function ExportButtons({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={() => exportToPdf(title, columns, rows)}>
        <FileDown /> PDF
      </Button>
      <Button variant="ghost" size="sm" onClick={() => exportToExcel(title, columns, rows)}>
        <SheetIcon /> Excel
      </Button>
    </div>
  );
}
