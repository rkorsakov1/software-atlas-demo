import Link from "next/link";

import { StoryRoute } from "@/components/story/StoryRoute";
import { Button } from "@/components/ui/button";
import { companies, emerging, eras, events, markets } from "@/data";

type Stat = { value: string; label: string };

const STATS: readonly Stat[] = [
  { value: String(eras.length), label: "eras" },
  { value: String(markets.length), label: "markets" },
  { value: String(companies.length), label: "companies" },
  { value: String(events.length), label: "events" },
  { value: String(emerging.length), label: "emerging markets" },
];

const StoryPage = (): React.ReactElement => (
  <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-12 sm:px-6 2xl:max-w-[1760px]">
    <header className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        1950 to today
      </p>
      <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        The Software Atlas
      </h1>
      <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
        How software markets are born, consolidate, get disrupted and give rise to new ones. Ten
        chapters, {eras.length} eras, one recurring pattern.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/explore/">Explore the data</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/methodology/">How this was built</Link>
        </Button>
      </div>

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</span>
              <span className="ml-1.5 text-sm text-muted-foreground">{stat.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </header>

    <div className="mt-14">
      <StoryRoute />
    </div>
  </div>
);

export default StoryPage;
