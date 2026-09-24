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
    title: "Markets often appear when a platform stops giving something away",
    body: "IBM priced software separately in 1969 and an industry appeared. Browsers and app stores repeated the move, and AI models may be next. It's a frequent route to a new market, not the only one.",
  },
  {
    title: "Survivors' habits aren't a recipe",
    body: "Survivors often held a layer the new platform needed, disrupted themselves first, or bought the challenger. But Sun held Java and still sold out, and Novell bought WordPerfect and still lost. The habits are common to winners and losers alike.",
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
        How software markets are born, consolidate, get disrupted and give rise to new ones.{" "}
        <span className="whitespace-nowrap">Ten chapters, {eras.length} eras:</span> what repeats,
        and where it doesn&apos;t.
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
      <p className="mt-10 text-sm text-muted-foreground">
        This is our reading of the evidence, not fact. The numbers are in{" "}
        <Link href="/explore/" className="underline underline-offset-4">
          Explore
        </Link>
        ; the gaps are on the{" "}
        <Link href="/contribute/" className="underline underline-offset-4">
          Contribute
        </Link>{" "}
        page.
      </p>
    </section>
  </div>
);

export default StoryPage;
