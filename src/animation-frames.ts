import { Observable } from "rxjs";

/**
 * Returns an observable that will keep emitting on every
 * animation frame. The emitted number is the number of ms
 * since the first frame.
 */
export function animationFrames(): Observable<number> {
  return new Observable<number>((subscriber) => {
    if (
      typeof window !== "object" ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      subscriber.error(new Error("No window.requestAnimationFrame available"));
      return;
    }
    let firstTime: number | undefined;
    let afHandle: number | undefined = requestAnimationFrame();
    subscriber.add(() => {
      if (afHandle !== undefined) {
        cancelAnimationFrame(afHandle);
      }
    });

    function handleAnimationFrame(ms: number) {
      if (!subscriber.closed) {
        if (firstTime === undefined) {
          firstTime = ms;
        }
        subscriber.next(ms - firstTime);
        afHandle = requestAnimationFrame();
      } else {
        afHandle = undefined;
      }
    }

    function requestAnimationFrame() {
      try {
        return window.requestAnimationFrame(handleAnimationFrame);
      } catch (e) {
        subscriber.error(e);
      }
    }
  });
}
