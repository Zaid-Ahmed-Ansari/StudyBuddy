// components/ui/loader.tsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Optional: if you use className utility

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center h-full w-full", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
