import * as React from "react";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DeletedMessageInfo {
  deletedAt: string;
  deletedBy?: string | null;
  reason?: string | null;
}

interface Props {
  /** Conteúdo original da mensagem (visível apenas p/ admin/supervisor) */
  originalContent: string;
  info: DeletedMessageInfo;
  /** Se false, exibe apenas "Mensagem apagada" sem conteúdo */
  canViewContent?: boolean;
  className?: string;
}

export function DeletedMessageBadge({ originalContent, info, canViewContent = false, className }: Props) {
  const deletedAt = React.useMemo(
    () => format(new Date(info.deletedAt), "dd/MM/yy HH:mm", { locale: ptBR }),
    [info.deletedAt],
  );

  if (!canViewContent) {
    return (
      <span className={cn("flex items-center gap-1 text-xs italic text-muted-foreground", className)}>
        <Trash2 className="h-3 w-3" />
        Mensagem apagada
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "group relative rounded-md border border-dashed border-muted-foreground/30",
              "bg-muted/40 px-3 py-2 opacity-60 transition-opacity hover:opacity-100",
              className,
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Trash2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Mensagem apagada
              </span>
            </div>
            <p className="text-sm text-foreground/70 line-through decoration-muted-foreground/40">
              {originalContent}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs space-y-1">
          <p>
            <span className="font-medium">Removida em:</span> {deletedAt}
          </p>
          {info.deletedBy && (
            <p>
              <span className="font-medium">Por:</span> {info.deletedBy}
            </p>
          )}
          {info.reason && (
            <p>
              <span className="font-medium">Motivo:</span> {info.reason}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
