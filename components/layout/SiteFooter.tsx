import Link from "next/link";

const REPO_URL = "https://github.com/rkorsakov1/software-atlas-demo";

export const SiteFooter = (): React.ReactElement => (
  <footer className="mt-16 border-t border-border">
    <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
      <span>Every figure is sourced and labelled reported, estimated or modeled.</span>
      <Link href="/methodology/" className="underline underline-offset-4 hover:text-foreground">
        Methodology
      </Link>
      <Link href="/contribute/" className="underline underline-offset-4 hover:text-foreground">
        Help complete the Atlas
      </Link>
      <a href={REPO_URL} className="underline underline-offset-4 hover:text-foreground">
        GitHub
      </a>
    </div>
  </footer>
);
