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

type Takeaway = { title: string; body: string };

/** The Atlas's own synthesis of the ten chapters: analysis, not new facts. */
const TAKEAWAYS: readonly Takeaway[] = [
  {
    title: "Markets appear when a platform stops giving something away",
    body: "IBM priced software separately in 1969 and an industry appeared. Browsers, app stores and now AI models repeat the move: whatever the platform stops bundling becomes someone's market.",
  },
  {
    title: "Survivors own a layer the next platform still needs",
    body: "Across eleven eras, incumbents lasted by holding something the new platform depended on, by disrupting themselves first, or by buying the challenger at a price that looked absurd at the time.",
  },
  {
    title: "Concentration rotates more than it ratchets",
    body: "In cloud, the top three grew from half the market to two thirds while the leader lost share. More oligopoly and less dominance can happen at once, so no single measure tells the story.",
  },
  {
    title: "Bundling and unbundling alternate, faster each cycle",
    body: "Suites absorb specialists when stitching tools together becomes the pain, and specialists split off when a suite serves a segment badly. The gap between founding and a multi-billion exit keeps shrinking.",
  },
  {
    title: "AI has moved valuations more than revenues, so far",
    body: "Incumbents' reported revenue is still growing. The signals to watch are seat counts, net retention and how much new business is priced on usage or outcomes rather than seats.",
  },
  {
    title: "The next markets are as likely to come from law as from labs",
    body: "A third of the candidate markets are driven by regulation or falling costs rather than AI. Mandates like e-invoicing create buyers with no option to wait.",
  },
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

    <section aria-labelledby="takeaways" className="mt-16 border-t border-border pt-12">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        After ten chapters
      </p>
      <h2 id="takeaways" className="mt-2 text-3xl font-semibold tracking-tight">
        What it adds up to
      </h2>
      <ol className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {TAKEAWAYS.map((takeaway, index) => (
          <li key={takeaway.title} className="flex gap-4">
            <span className="font-mono text-sm text-brand">{index + 1}</span>
            <div>
              <h3 className="font-semibold">{takeaway.title}</h3>
              <p className="mt-1 text-pretty leading-relaxed text-muted-foreground">
                {takeaway.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 max-w-3xl text-pretty text-sm text-muted-foreground">
        These are our reading of the evidence, not facts. Every number behind them is in{" "}
        <Link href="/explore/" className="underline underline-offset-4">
          Explore
        </Link>
        , and the gaps are listed on{" "}
        <Link href="/contribute/" className="underline underline-offset-4">
          Help complete the Atlas
        </Link>
        .
      </p>
    </section>
  </div>
);

export default StoryPage;
