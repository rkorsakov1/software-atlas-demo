"use client";

import { ConfidenceBadge } from "@/components/charts/primitives/ConfidenceBadge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Confidence } from "@/data/types";
import { cn } from "@/lib/cn";

export type DataTableColumn<TRow> = {
  key: string;
  header: string;
  align?: "left" | "right";
  /** Return a string, or a React node for the rare cell that needs markup. */
  render: (row: TRow) => React.ReactNode;
  numeric?: boolean;
};

export type DataTableProps<TRow> = {
  caption: string;
  columns: readonly DataTableColumn<TRow>[];
  rows: readonly TRow[];
  getRowKey: (row: TRow) => string;
  /** Adds a trailing confidence column, which most chart tables want. */
  getConfidence?: (row: TRow) => { confidence: Confidence; note?: string };
  maxHeight?: number;
  className?: string;
};

/**
 * The accessible alternative behind every chart's "View as table" toggle. It is a
 * real semantic table, so screen readers and copy-paste both work.
 */
export const DataTable = <TRow,>({
  caption,
  columns,
  rows,
  getRowKey,
  getConfidence,
  maxHeight = 420,
  className,
}: DataTableProps<TRow>): React.ReactElement => {
  if (rows.length === 0) {
    return (
      <p className={cn("py-6 text-sm text-muted-foreground", className)}>
        No rows for the current selection.
      </p>
    );
  }

  return (
    <div className={cn("overflow-auto rounded-md border border-border", className)} style={{ maxHeight }}>
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn("whitespace-nowrap", { "text-right": column.align === "right" })}
              >
                {column.header}
              </TableHead>
            ))}
            {getConfidence ? (
              <TableHead scope="col" className="whitespace-nowrap">
                Confidence
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const confidence = getConfidence?.(row);
            return (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("align-top", {
                      "text-right font-mono tabular-nums": column.numeric === true,
                    })}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
                {confidence ? (
                  <TableCell className="align-top">
                    <ConfidenceBadge confidence={confidence.confidence} note={confidence.note} />
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
