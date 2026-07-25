"use client";

import { useActionState, useState } from "react";
import { Upload, FolderPlus } from "lucide-react";
import { uploadDocument, createFolder } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UploadDocumentDialog({ folderId }: { folderId: string | null }) {
  const [open, setOpen] = useState(false);
  const uploadWithFolder = uploadDocument.bind(null, folderId);
  const [state, formAction, pending] = useActionState(uploadWithFolder, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload /> Enviar arquivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="file">Arquivo</Label>
            <Input id="file" name="file" type="file" required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewFolderDialog({ parentId }: { parentId: string | null }) {
  const [open, setOpen] = useState(false);
  const createWithParent = createFolder.bind(null, parentId);
  const [state, formAction, pending] = useActionState(createWithParent, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus /> Nova pasta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova pasta</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da pasta</Label>
            <Input id="name" name="name" required autoFocus />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar pasta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
