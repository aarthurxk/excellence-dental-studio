import * as React from "react";
import { Check, ChevronsUpDown, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getReadableTextColor, type LeadTag } from "@/hooks/useLeadTags";

interface Props {
  tags: LeadTag[];
  selected: string[];
  onChange: (ids: string[]) => void;
  /** Opcional: mapa { tagId: count } para exibir contagem por tag */
  counts?: Record<string, number>;
  className?: string;
  placeholder?: string;
}

export function TagFilter({
  tags,
  selected,
  onChange,
  counts,
  className,
  placeholder = "Filtrar por etiqueta",
}: Props) {
  const [open, setOpen] = React.useState(false);

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    );
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s !== id));
  }

  function clear() {
    onChange([]);
  }

  const selectedTags = tags.filter((t) => selected.includes(t.id));

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="h-8 gap-1.5 text-xs font-normal border-dashed"
          >
            <Tag className="h-3.5 w-3.5" />
            {placeholder}
            {selected.length > 0 && (
              <Badge
                variant="secondary"
                className="h-4 rounded px-1 text-[10px] font-medium ml-0.5"
              >
                {selected.length}
              </Badge>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 ml-0.5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar etiqueta..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty className="py-4 text-xs text-center text-muted-foreground">
                Nenhuma etiqueta encontrada.
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => {
                  const isSelected = selected.includes(tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => toggle(tag.id)}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 truncate">{tag.name}</span>
                      {counts?.[tag.id] !== undefined && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {counts[tag.id]}
                        </span>
                      )}
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-primary",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected chips */}
      {selectedTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: tag.color,
            color: getReadableTextColor(tag.color),
          }}
        >
          {tag.name}
          <button
            type="button"
            onClick={() => remove(tag.id)}
            className="opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none"
            aria-label={`Remover ${tag.name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {selected.length > 0 && (
        <button
          type="button"
          onClick={clear}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-0.5"
        >
          Limpar
        </button>
      )}
    </div>
  );
}
