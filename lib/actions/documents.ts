"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import type { DocumentFileType } from "@/types/database.types";

export type DocumentActionState = { error?: string } | undefined;

function inferFileType(mime: string, name: string): DocumentFileType {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) return "docx";
  if (mime.includes("sheet") || name.endsWith(".xlsx") || name.endsWith(".xls")) return "xlsx";
  if (mime.startsWith("image/")) return "image";
  return "other";
}

export async function createFolder(
  parentId: string | null,
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe um nome para a pasta." };

  const supabase = await createClient();
  const { error } = await supabase.from("document_folders").insert({
    organization_id: session.profile.organization_id,
    parent_id: parentId,
    name,
    created_by: session.profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/documents");
  return undefined;
}

export async function uploadDocument(
  folderId: string | null,
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const supabase = await createClient();
  const orgId = session.profile.organization_id;
  const path = `${orgId}/${folderId ?? "root"}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, {
    contentType: file.type,
  });

  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase.from("documents").insert({
    organization_id: orgId,
    folder_id: folderId,
    process_id: String(formData.get("process_id") ?? "") || null,
    client_id: String(formData.get("client_id") ?? "") || null,
    name: file.name,
    file_path: path,
    file_type: inferFileType(file.type, file.name),
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: session.profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/documents");
  return undefined;
}

export async function deleteDocument(documentId: string, filePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("documents").remove([filePath]);
  await supabase.from("documents").delete().eq("id", documentId);
  revalidatePath("/documents");
}

export async function toggleDocumentOcr(documentId: string, ocrReady: boolean) {
  const supabase = await createClient();
  await supabase.from("documents").update({ ocr_ready: ocrReady }).eq("id", documentId);
  revalidatePath("/documents");
}

export async function getDocumentSignedUrl(filePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from("documents").createSignedUrl(filePath, 60 * 10);
  return data?.signedUrl ?? null;
}
