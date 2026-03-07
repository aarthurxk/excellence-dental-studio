import { Plus } from "lucide-react";

interface SectionDividerProps {
  className?: string;
}

const SectionDivider = ({ className = "" }: SectionDividerProps) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="h-5 w-5 border-2 border-primary rounded-sm flex items-center justify-center">
      <Plus className="h-3 w-3 text-primary" />
    </div>
    <div className="h-0.5 w-12 bg-primary" />
  </div>
);

export default SectionDivider;
