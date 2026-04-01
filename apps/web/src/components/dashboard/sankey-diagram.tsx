import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  type SankeyNode,
  type SankeyLink,
} from "d3-sankey";
import { useCallback, useMemo, useRef, useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { SankeyLinkExtra, SankeyNodeExtra } from "@/lib/sankey-utils";

import { SankeyTooltip } from "./sankey-tooltip";

type LayoutNode = SankeyNode<SankeyNodeExtra, SankeyLinkExtra>;
type LayoutLink = SankeyLink<SankeyNodeExtra, SankeyLinkExtra>;

const NODE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function getNodeColor(node: LayoutNode): string {
  const col = (node as SankeyNodeExtra).column ?? 0;
  return NODE_COLORS[col % NODE_COLORS.length];
}

type TooltipData = {
  label: string;
  value: number;
  total: number;
  x: number;
  y: number;
};

export function SankeyDiagram({
  nodes: rawNodes,
  links: rawLinks,
  totalIncome,
  onNodeClick,
}: {
  nodes: SankeyNodeExtra[];
  links: SankeyLinkExtra[];
  totalIncome: number;
  onNodeClick?: (node: SankeyNodeExtra) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoverNodeIdx, setHoverNodeIdx] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  const observerRef = useRef<ResizeObserver | null>(null);
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(rect.width, 300),
        height: Math.max(Math.min(rect.width * 0.5, 500), 280),
      });
    };
    measure();
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(el);
  }, []);

  const { layoutNodes, layoutLinks } = useMemo(() => {
    if (rawNodes.length === 0 || rawLinks.length === 0) {
      return { layoutNodes: [] as LayoutNode[], layoutLinks: [] as LayoutLink[] };
    }

    const nodesCopy = rawNodes.map((n) => ({ ...n }));
    const linksCopy = rawLinks.map((l) => ({ ...l }));

    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const layout = d3Sankey<SankeyNodeExtra, SankeyLinkExtra>()
      .nodeWidth(12)
      .nodePadding(14)
      .nodeSort(null)
      .extent([
        [margin.left, margin.top],
        [dimensions.width - margin.right, dimensions.height - margin.bottom],
      ]);

    const graph = layout({
      nodes: nodesCopy,
      links: linksCopy,
    });

    return {
      layoutNodes: graph.nodes,
      layoutLinks: graph.links,
    };
  }, [rawNodes, rawLinks, dimensions]);

  const linkPathGen = sankeyLinkHorizontal();

  const handleNodeHover = useCallback(
    (e: React.MouseEvent, node: LayoutNode, idx: number) => {
      setHoverNodeIdx(idx);
      setTooltip({
        label: (node as SankeyNodeExtra).label,
        value: node.value ?? 0,
        total: totalIncome,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [totalIncome],
  );

  const handleLinkHover = useCallback(
    (e: React.MouseEvent, link: LayoutLink) => {
      const sourceNode = link.source as LayoutNode;
      const targetNode = link.target as LayoutNode;
      setTooltip({
        label: `${(sourceNode as SankeyNodeExtra).label} → ${(targetNode as SankeyNodeExtra).label}`,
        value: link.value ?? 0,
        total: totalIncome,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [totalIncome],
  );

  const clearHover = useCallback(() => {
    setHoverNodeIdx(null);
    setTooltip(null);
  }, []);

  if (rawNodes.length === 0) {
    return (
      <div
        ref={setContainerRef}
        className="flex h-64 w-full items-center justify-center border border-dashed border-border"
      >
        <p className="font-mono text-xs text-muted-foreground">
          Add income and expenses to see your budget flow
        </p>
      </div>
    );
  }

  return (
    <div ref={setContainerRef} className="relative w-full">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full"
      >
        <g>
          {layoutLinks.map((link, i) => {
            const sourceNode = link.source as LayoutNode;
            const sourceIdx = typeof link.source === "number"
              ? link.source
              : (sourceNode as LayoutNode & { index?: number }).index ?? 0;
            const isHighlighted =
              hoverNodeIdx === null ||
              sourceIdx === hoverNodeIdx ||
              ((link.target as LayoutNode & { index?: number }).index ?? -1) === hoverNodeIdx;
            return (
              <path
                key={i}
                d={linkPathGen(link as Parameters<typeof linkPathGen>[0]) ?? ""}
                fill="none"
                stroke={getNodeColor(sourceNode)}
                strokeWidth={Math.max(1, link.width ?? 1)}
                strokeOpacity={isHighlighted ? 0.35 : 0.08}
                className="transition-[stroke-opacity] duration-150"
                onMouseMove={(e) => handleLinkHover(e, link)}
                onMouseLeave={clearHover}
              />
            );
          })}
        </g>
        <g>
          {layoutNodes.map((node, i) => {
            const x0 = node.x0 ?? 0;
            const y0 = node.y0 ?? 0;
            const x1 = node.x1 ?? 0;
            const y1 = node.y1 ?? 0;
            const height = y1 - y0;
            const isHighlighted = hoverNodeIdx === null || hoverNodeIdx === i;
            const extra = node as SankeyNodeExtra;

            return (
              <g key={extra.id}>
                <rect
                  x={x0}
                  y={y0}
                  width={x1 - x0}
                  height={height}
                  fill={getNodeColor(node)}
                  fillOpacity={isHighlighted ? 1 : 0.3}
                  className="cursor-pointer transition-[fill-opacity] duration-150"
                  onMouseMove={(e) => handleNodeHover(e, node, i)}
                  onMouseLeave={clearHover}
                  onClick={() => onNodeClick?.(extra)}
                />
                {height > 10 && (
                  <text
                    x={extra.column <= 1 ? x0 - 6 : x1 + 6}
                    y={y0 + height / 2}
                    dy="0.35em"
                    textAnchor={extra.column <= 1 ? "end" : "start"}
                    className="pointer-events-none fill-foreground font-mono text-[10px]"
                  >
                    {extra.label}
                  </text>
                )}
                {height > 24 && (
                  <text
                    x={extra.column <= 1 ? x0 - 6 : x1 + 6}
                    y={y0 + height / 2 + 12}
                    dy="0.35em"
                    textAnchor={extra.column <= 1 ? "end" : "start"}
                    className="pointer-events-none fill-muted-foreground font-mono text-[9px]"
                  >
                    {formatCurrency(node.value ?? 0)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <SankeyTooltip data={tooltip} />
    </div>
  );
}
