import { createClient } from "@/lib/supabase/server";

export async function getFolderContents(folderId: string | null) {
  const supabase = await createClient();

  const foldersQuery = supabase.from("document_folders").select("id, name, created_at").order("name");
  const documentsQuery = supabase
    .from("documents")
    .select("id, name, file_type, size_bytes, ocr_ready, file_path, created_at")
    .order("created_at", { ascending: false });

  const [{ data: folders }, { data: documents }, { data: breadcrumbFolder }] = await Promise.all([
    folderId ? foldersQuery.eq("parent_id", folderId) : foldersQuery.is("parent_id", null),
    folderId ? documentsQuery.eq("folder_id", folderId) : documentsQuery.is("folder_id", null),
    folderId
      ? supabase.from("document_folders").select("id, name, parent_id").eq("id", folderId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    folders: folders ?? [],
    documents: documents ?? [],
    currentFolder: breadcrumbFolder,
  };
}

export async function getFolderBreadcrumb(folderId: string | null) {
  const supabase = await createClient();
  const trail: { id: string; name: string }[] = [];
  let currentId = folderId;

  while (currentId) {
    const { data } = await supabase
      .from("document_folders")
      .select("id, name, parent_id")
      .eq("id", currentId)
      .maybeSingle();
    if (!data) break;
    trail.unshift({ id: data.id, name: data.name });
    currentId = data.parent_id;
  }

  return trail;
}
