'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

    const safeId = `mermaid-${Math.floor(Math.random() * 1000000)}`; // no decimals

    const renderMermaid = async () => {
      try {
        const { svg } = await mermaid.render(safeId, chart);
        if (ref.current) {
          ref.current.innerHTML = svg;

          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', 'auto');
            svgElement.style.maxWidth = '100%';
          }
        }
      } catch (err) {
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-500 font-mono">Mermaid render error: ${err}</div>`;
        }
        console.error('Mermaid render error:', err);
      }
    };

    renderMermaid();
  }, [chart]);

  return (
    <div className="mermaid-chart overflow-x-auto max-w-full rounded-lg border border-gray-600 bg-white dark:bg-black p-2">
      <div ref={ref} className="min-w-[500px]" />
    </div>
  );
}
