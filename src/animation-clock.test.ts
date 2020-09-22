import { Subject } from "rxjs";
import { animationClock } from "./animation-clock";

test("normal operation", () => {
  const upstream = new Subject<number>();
  const results: number[] = [];
  let completed = false;
  upstream.pipe(animationClock(3000)).subscribe({
    next(v) {
      results.push(v);
    },
    complete() {
      completed = true;
    },
  });
  expect(completed).toBe(false);
  expect(upstream.observers.length).toBe(1);
  expect(results).toEqual([]);
  upstream.next(0);
  expect(results).toEqual([0]);
  expect(completed).toBe(false);
  upstream.next(1500);
  expect(results).toEqual([0, 0.5]);
  expect(completed).toBe(false);
  upstream.next(3000);
  expect(results).toEqual([0, 0.5, 1]);
  expect(completed).toBe(true);
  expect(upstream.observers.length).toBe(0);
});

test("1 is always sent", () => {
  const upstream = new Subject<number>();
  const results: number[] = [];
  upstream.pipe(animationClock(3000)).subscribe({
    next(v) {
      results.push(v);
    },
  });
  upstream.next(0);
  upstream.next(3001);
  expect(results).toEqual([0, 1]);
  expect(upstream.observers.length).toBe(0);
});

test("early completion", () => {
  const upstream = new Subject<number>();
  const results: number[] = [];
  let completed = false;
  upstream.pipe(animationClock(3000)).subscribe({
    next(v) {
      results.push(v);
    },
    complete() {
      completed = true;
    },
  });
  upstream.next(0);
  upstream.complete();
  expect(results).toEqual([0]);
  expect(completed).toBe(true);
  expect(upstream.observers.length).toBe(0);
});

test("error propagation", () => {
  const upstream = new Subject<number>();
  const results: number[] = [];
  let completed = false;
  let failed = false;
  upstream.pipe(animationClock(3000)).subscribe({
    next(v) {
      results.push(v);
    },
    complete() {
      completed = true;
    },
    error() {
      failed = true;
    },
  });
  upstream.next(0);
  upstream.error(new Error("DWEB!"));
  expect(results).toEqual([0]);
  expect(completed).toBe(false);
  expect(failed).toBe(true);
  expect(upstream.observers.length).toBe(0);
});
