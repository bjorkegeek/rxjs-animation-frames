import { MonoTypeOperatorFunction, Observable } from "rxjs";

/**
 * An operator to put in the pipe after animationFrames.
 * It will convert millisecond values to a clock value between
 * 0 and 1, where 1 is the provided length of the animation.
 * After 1 has been emitted, the observable will immediately complete.
 *
 * Unless the source observable completes prematurely, the returned observable
 * will always emit 1 before completing.
 *
 * @param animationLength The length of the animation in milliseconds
 */
export function animationClock(
  animationLength: number
): MonoTypeOperatorFunction<number> {
  return (src: Observable<number>) =>
    new Observable<number>((subscriber) => {
      const subscription = src.subscribe({
        complete: () => subscriber.complete(),
        error: () => subscriber.error(),
        next: (v) => {
          if (v >= animationLength) {
            subscription.unsubscribe();
            subscriber.remove(subscription);
            subscriber.next(1);
            subscriber.complete();
          } else {
            subscriber.next(v / animationLength);
          }
        },
      });
      subscriber.add(subscription);
    });
}
