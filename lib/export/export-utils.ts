"use client";

export async function exportToPdf(title: string, columns: string[], rows: (string | number)[][]) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [columns],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  doc.save(`${slug(title)}.pdf`);
}

export async function exportToExcel(title: string, columns: string[], rows: (string | number)[][]) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
  XLSX.writeFile(workbook, `${slug(title)}.xlsx`);
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}
