import type { Source } from "@/data/types";

/**
 * The three states a citation can be in, derived from the source itself rather
 * than listed by hand anywhere, so the UI copy cannot drift when a source is
 * downgraded. `verified: true` means the URL was retrieved in this project *and*
 * the figure was seen in the retrieved content. An unverified source is then one
 * of two very different things: literature cited without a URL by design, or a
 * real page that was located but whose substance nobody here has read.
 */
export type VerificationState = "verified" | "literature" | "retrieved-unread";

export const verificationState = (source: Source): VerificationState => {
  if (source.verified) {
    return "verified";
  }
  if (source.url === undefined) {
    return "literature";
  }
  return "retrieved-unread";
};

/** Short badge text, used wherever a source is printed in a list or a chip. */
export const verificationLabel: Record<VerificationState, string> = {
  verified: "✓ verified",
  literature: "◇ cited from the literature",
  "retrieved-unread": "◇ retrieved, unread",
};

/** One sentence saying what the state means. Used for tooltips and aria labels. */
export const verificationExplanation: Record<VerificationState, string> = {
  verified:
    "The cited URL was retrieved in this project and the figure was seen in the retrieved content.",
  literature:
    "A book, paper or case-law citation from the literature. It carries no URL by design and never backs a reported figure.",
  "retrieved-unread":
    "The page was located but its body is paywalled or its host blocks automated fetching, so nobody in this project has read the figure inside. The link is kept so you can try it yourself; figures resting on it ship as estimated.",
};
