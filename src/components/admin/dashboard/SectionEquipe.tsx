import { AtendentesOnline } from "./AtendentesOnline";
import { RankingAtendentes } from "./RankingAtendentes";

export function SectionEquipe() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-base font-semibold tracking-tight">Equipe</h3>
        <AtendentesOnline />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Ranking — agendamentos
        </p>
        <RankingAtendentes />
      </div>
    </div>
  );
}
