"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  sectionKey: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (instruction?: string) => void;
}

export function SectionRegenModal({
  open,
  sectionKey,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const [instruction, setInstruction] = useState("");

  const handleConfirm = () => {
    onConfirm(instruction.trim() || undefined);
    setInstruction("");
  };

  const handleClose = () => {
    if (!isLoading) {
      setInstruction("");
      onClose();
    }
  };

  const sectionLabel = sectionKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Перегенерировать:{" "}
            <span className="text-[#0066FF]">{sectionLabel}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="text-sm text-[#616161] mb-1.5 block">
              Дополнительные пожелания{" "}
              <span className="text-[#9e9e9e]">(необязательно)</span>
            </Label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Сделай более агрессивный заголовок, добавь цифры..."
              className="resize-none h-24 text-sm"
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <p className="text-sm text-[#8e8e93] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI обновляет секцию...
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#0066FF] hover:bg-[#0052CC]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерирую...
              </>
            ) : (
              "Перегенерировать"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
