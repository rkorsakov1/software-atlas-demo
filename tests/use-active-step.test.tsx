import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useActiveStep } from "@/components/story/useActiveStep";

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
};

const observers: ObserverRecord[] = [];

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[] = [0];
  private readonly record: ObserverRecord;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.rootMargin = options?.rootMargin ?? "";
    this.record = { callback, targets: new Set<Element>() };
    observers.push(this.record);
  }

  observe(target: Element): void {
    this.record.targets.add(target);
  }

  unobserve(target: Element): void {
    this.record.targets.delete(target);
  }

  disconnect(): void {
    this.record.targets.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const entryFor = (target: Element, isIntersecting: boolean): IntersectionObserverEntry =>
  ({ target, isIntersecting }) as IntersectionObserverEntry;

const emit = (changes: readonly { index: number; isIntersecting: boolean }[]): void => {
  const record = observers[observers.length - 1];
  if (!record) throw new Error("no observer was created");
  const targets = [...record.targets];
  const entries = changes.map((change) => {
    const target = targets.find(
      (node) => node.getAttribute("data-step-index") === String(change.index),
    );
    if (!target) throw new Error(`step ${change.index} is not observed`);
    return entryFor(target, change.isIntersecting);
  });
  act(() => {
    record.callback(entries, {} as IntersectionObserver);
  });
};

const Harness = ({ steps }: { steps: number }): React.ReactElement => {
  const { activeIndex, registerStep } = useActiveStep(steps);
  return (
    <div>
      <output data-testid="active">{activeIndex}</output>
      {Array.from({ length: steps }, (_unused, index) => (
        <section key={index} ref={registerStep(index)}>
          step {index}
        </section>
      ))}
    </div>
  );
};

const activeIndex = (): string => screen.getByTestId("active").textContent ?? "";

describe("useActiveStep", () => {
  beforeEach(() => {
    observers.length = 0;
    window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
    globalThis.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    observers.length = 0;
  });

  it("observes every step through a reading band inside the viewport", () => {
    render(<Harness steps={4} />);
    const record = observers[observers.length - 1];
    expect(record?.targets.size).toBe(4);
  });

  it("advances as later chapters cross the band", () => {
    render(<Harness steps={4} />);
    expect(activeIndex()).toBe("0");

    emit([{ index: 1, isIntersecting: true }]);
    emit([{ index: 0, isIntersecting: false }]);
    expect(activeIndex()).toBe("1");

    emit([{ index: 2, isIntersecting: true }]);
    emit([{ index: 1, isIntersecting: false }]);
    expect(activeIndex()).toBe("2");
  });

  it("keeps a tall chapter active while it alone covers the band", () => {
    render(<Harness steps={4} />);
    emit([
      { index: 1, isIntersecting: true },
      { index: 0, isIntersecting: false },
    ]);
    expect(activeIndex()).toBe("1");

    // A chapter taller than the viewport reports nothing for a long stretch.
    emit([]);
    expect(activeIndex()).toBe("1");
  });

  it("goes back when the reader scrolls up", () => {
    render(<Harness steps={4} />);
    emit([{ index: 1, isIntersecting: true }]);
    emit([{ index: 0, isIntersecting: false }]);
    expect(activeIndex()).toBe("1");

    emit([{ index: 0, isIntersecting: true }]);
    expect(activeIndex()).toBe("0");
  });

  it("holds the last step rather than resetting when nothing crosses the band", () => {
    render(<Harness steps={3} />);
    emit([{ index: 2, isIntersecting: true }]);
    emit([
      { index: 0, isIntersecting: false },
      { index: 1, isIntersecting: false },
    ]);
    expect(activeIndex()).toBe("2");

    emit([{ index: 2, isIntersecting: false }]);
    expect(activeIndex()).toBe("2");
  });
});
