import Link from "next/link";
import { Folder, FileText, Trash2, ScanText, ChevronRight } from "lucide-react";
import { getFolderContents, getFolderBreadcrumb } from "@/lib/data/documents";
import { deleteDocument, toggleDocumentOcr } from "@/lib/actions/documents";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadDocumentDialog, NewFolderDialog } from "@/components/documents/upload-dialog";
import { formatDate } from "@/lib/utils";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const folderId = folder ?? null;

  const [{ folders, documents }, breadcrumb] = await Promise.all([
    getFolderContents(folderId),
    getFolderBreadcrumb(folderId),
  ]);

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Organize petições, contratos e evidências em pastas."
        actions={
          <>
            <NewFolderDialog parentId={folderId} />
            <UploadDocumentDialog folderId={folderId} />
          </>
        }
      />

      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/documents" className="hover:text-foreground hover:underline">
          Documentos
        </Link>
        {breadcrumb.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            <Link href={`/documents?folder=${crumb.id}`} className="hover:text-foreground hover:underline">
              {crumb.name}
            </Link>
          </span>
        ))}
      </div>

      {folders.length === 0 && documents.length === 0 ? (
        <EmptyState icon={FileText} title="Pasta vazia" description="Envie um arquivo ou crie uma subpasta." />
      ) : (
        <div className="flex flex-col gap-2">
          {folders.map((f) => (
            <Link key={f.id} href={`/documents?folder=${f.id}`}>
              <Card className="flex-row items-center gap-3 p-4 hover:bg-secondary/50">
                <Folder className="size-5 text-accent" />
                <p className="text-sm font-medium">{f.name}</p>
              </Card>
            </Link>
          ))}
          {documents.map((doc) => {
            const deleteAction = deleteDocument.bind(null, doc.id, doc.file_path);
            const toggleOcr = toggleDocumentOcr.bind(null, doc.id, !doc.ocr_ready);
            return (
              <Card key={doc.id} className="flex-row items-center justify-between gap-3 p-4">
                <a
                  href={`/api/documents/${doc.id}/url`}
                  target="_blank"
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.size_bytes)} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                </a>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={doc.ocr_ready ? "success" : "outline"}>
                    {doc.ocr_ready ? "OCR pronto" : "Sem OCR"}
                  </Badge>
                  <form action={toggleOcr}>
                    <Button variant="ghost" size="icon" type="submit" title="Alternar OCR">
                      <ScanText className="size-4" />
                    </Button>
                  </form>
                  <form action={deleteAction}>
                    <Button variant="ghost" size="icon" type="submit" title="Excluir">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
