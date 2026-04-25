import { useState } from "react";
import { Plus, X, Tag as TagIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  useTags,
  useLeadTags,
  useTagMutations,
  getReadableTextColor,
  type LeadTag,
} from "@/hooks/useLeadTags";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#EF4444", "#F59E0B", "#EAB308", "#10B981",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#6B7280", "#1f2937",
];

interface Props {
  leadId: string;
  size?: "sm" | "md";
  showAddButton?: boolean;
}

export function LeadTagChip({
  tag,
  onRemove,
  size = "sm",
}: {
  tag: LeadTag;
  onRemove?: () => void;
  size?: "sm" | "md";
}) {
  const fg = getReadableTextColor(tag.color);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium leading-none whitespace-nowrap",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      )}
      style={{ backgroundColor: tag.color, color: fg }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70"
          aria-label={`Remover etiqueta ${tag.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export default function LeadTagsEditor({ leadId, size = "sm", showAddButton = true }: Props) {
  const { data: allTags = [] } = useTags();
  const { data: leadTags = [] } = useLeadTags(leadId);
  const { assignTag, unassignTag, createTag, deleteTag } = useTagMutations();

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[5]);

  const assignedIds = new Set(leadTags.map((t) => t.id));

  const toggle = async (tagId: string) => {
    if (assignedIds.has(tagId)) {
      await unassignTag.mutateAsync({ leadId, tagId });
    } else {
      await assignTag.mutateAsync({ leadId, tagId });
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await createTag.mutateAsync({ name, color: newColor });
      await assignTag.mutateAsync({ leadId, tagId: created.id });
      setNewName("");
      toast.success("Etiqueta criada");
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Etiqueta já existe" : "Erro ao criar");
    }
  };

  const handleDeleteFromCatalog = async (tagId: string, name: string) => {
    if (!confirm(`Excluir etiqueta "${name}" do catálogo? Será removida de todos os leads.`)) return;
    try {
      await deleteTag.mutateAsync(tagId);
      toast.success("Etiqueta excluída");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {leadTags.map((tag) => (
        <LeadTagChip
          key={tag.id}
          tag={tag}
          size={size}
          onRemove={() => unassignTag.mutate({ leadId, tagId: tag.id })}
        />
      ))}

      {showAddButton && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-6 gap-1 text-[10px] rounded-full",
                size === "md" && "h-7 text-xs"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-3 w-3" /> Etiqueta
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-3"
            align="start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TagIcon className="h-3 w-3" /> Etiquetas disponíveis
              </div>

              <ScrollArea className="max-h-48">
                <div className="space-y-1 pr-2">
                  {allTags.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      Nenhuma etiqueta. Crie uma abaixo.
                    </p>
                  )}
                  {allTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted/50 group"
                    >
                      <Checkbox
                        checked={assignedIds.has(tag.id)}
                        onCheckedChange={() => toggle(tag.id)}
                      />
                      <LeadTagChip tag={tag} size="sm" />
                      <button
                        type="button"
                        onClick={() => handleDeleteFromCatalog(tag.id, tag.name)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        aria-label={`Excluir ${tag.name} do catálogo`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Criar nova</p>
                <Input
                  placeholder="Nome da etiqueta"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="h-8 text-xs"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-transform",
                        newColor === c ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewColor(c)}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={handleCreate}
                  disabled={!newName.trim() || createTag.isPending}
                >
                  Criar e atribuir
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
