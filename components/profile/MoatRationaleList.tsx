import { splitMoatRationale } from "@/lib/format";

export type MoatRationaleListProps = { rationale: string };

/** One line per scored moat, so each judgement can be read (and argued with) on its own. */
export const MoatRationaleList = ({ rationale }: MoatRationaleListProps): React.ReactElement => (
  <ul className="mt-3 space-y-2 text-sm leading-relaxed">
    {splitMoatRationale(rationale).map((line) => (
      <li key={`${line.label}-${line.text.slice(0, 24)}`} className="text-pretty">
        {line.label.length === 0 ? null : (
          <span className="mr-1.5 font-medium">
            {line.label} <span className="font-mono tabular-nums">{line.score}</span>
          </span>
        )}
        <span className="text-muted-foreground">{line.text}</span>
      </li>
    ))}
  </ul>
);
