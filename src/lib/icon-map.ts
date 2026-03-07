import {
  Smile, Sparkles, Stethoscope, Syringe, ScanFace, ShieldCheck,
  Heart, Cpu, Users, Shield, Star, Award, Clock, Zap, Eye,
  CheckCircle, ThumbsUp, Lightbulb, Target, Gem, Brush,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Smile, Sparkles, Stethoscope, Syringe, ScanFace, ShieldCheck,
  Heart, Cpu, Users, Shield, Star, Award, Clock, Zap, Eye,
  CheckCircle, ThumbsUp, Lightbulb, Target, Gem, Brush,
};

export function getIconComponent(name: string): LucideIcon {
  return iconMap[name] || Star;
}
