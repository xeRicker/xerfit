import { Zap, Droplets, Wheat, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type MacroType = 'protein' | 'fat' | 'carbs' | 'calories';

interface MacroIconProps {
  type: MacroType;
  size?: number;
  className?: string;
  colored?: boolean;
}

export function MacroIcon({ type, size = 14, className, colored = true }: MacroIconProps) {
  const Icon = {
    protein: Zap,
    fat: Droplets,
    carbs: Wheat,
    calories: Flame
  }[type];

  const colorClass = colored ? {
    protein: "text-protein",
    fat: "text-fat",
    carbs: "text-carbs",
    calories: "text-calories"
  }[type] : "text-muted-foreground";

  return <Icon size={size} className={cn(colorClass, className)} strokeWidth={2.5} />;
}
