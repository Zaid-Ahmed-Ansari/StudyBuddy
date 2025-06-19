'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function ExportMenu({ data }: { data: any[] }) {
  const handleExport = (type: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${type}.json`;
    a.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-white border-gray-700">Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 text-white">
        <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
        {/* CSV/PDF support can be added later */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
