# RxJS animationFrames
_by David Björkevik_

This module wraps the web browser `requestAnimationFrame` in an RxJS
observable.

Also included is an operator to work with an animation clock that goes from
0 to 1 and then stops, handling a few corner cases.

## Installation
```shell script
npm install rxjs-animation-frames
```

## Guide

### animationFrames
To start requesting animation frames, call the `animationFrames()` function
which takes no parameters and subscribe to the returned observable. It produces
values for a local clock on each callback from `requestAnimationFrame`. The
first value produced is always 0. Upon unsubscribe, any requested frame is
cancelled and no more frames are requested from the browser. 
> **Tip**: Use the 
> [completeWhen operator](https://www.npmjs.com/package/rxjs-complete-when) 
> to limit the subscription lifetime to that of your component.
    
### animationClock
To make it even easier to implement animations, pipe your `animationFrames()`
through the `animationClock` operator. This operator takes a single numeric
argument which defines the length of the animation. It will then transform the
local clock provided by `animationFrames` into an animation clock that goes from
0 to 1 and then completes (and thus unsubscribes from `animationFrames`).

In this setup, you will always get a 0 value emitted first, followed by
floating point numbers between 0 and 1.  A final value of exactly 1 is always
emitted right before completion.

## Example

```typescript

import { animationFrames, animationClock } from "rxjs-animation-clock";

// ...

animationFrames().pipe(animationClock(1000)).subscribe((aClock:number) => {
  document.getElementById("myElement").style["opacity"] = `${aClock}`;
});
```
