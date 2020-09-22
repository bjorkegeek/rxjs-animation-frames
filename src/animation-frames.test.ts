import { animationFrames } from "./animation-frames";

let savedWindow: typeof global.window;
let savedRequestAnimationFrame: typeof global.window.requestAnimationFrame;
let savedCancelAnimationFrame: typeof global.window.cancelAnimationFrame;
beforeEach(() => {
  savedWindow = global.window;
  if (!global.window) {
    /* @ts-ignore */ // eslint-disable-next-line
    global.window = {};
  }
  savedRequestAnimationFrame = global.window.requestAnimationFrame;
  savedCancelAnimationFrame = global.window.cancelAnimationFrame;
  global.window.requestAnimationFrame = mockRequestAnimationFrame;
  global.window.cancelAnimationFrame = mockCancelAnimationFrame;
});

afterEach(() => {
  global.window.requestAnimationFrame = savedRequestAnimationFrame;
  global.window.cancelAnimationFrame = savedCancelAnimationFrame; // eslint-disable-next-line
  /* @ts-ignore */ global.window = savedWindow;
});

test("normal usage", () => {
  const results: number[] = [];
  expect(getFrameCallbacks()).toHaveLength(0);
  const subscription = animationFrames().subscribe((v) => results.push(v));
  try {
    expect(getFrameCallbacks()).toHaveLength(1);
    fakeAnimationFrame();
    expect(results).toEqual([0]);
    fakeAnimationFrame();
    expect(results).toEqual([0, 20]);
  } finally {
    subscription.unsubscribe();
  }
  fakeAnimationFrame();
  expect(getFrameCallbacks()).toHaveLength(0);
});

test("bad requestAnimationFrame", () => {
  /* @ts-ignore */ // eslint-disable-next-line
  global.window.requestAnimationFrame = undefined;
  return expect(animationFrames().toPromise()).rejects.toThrow(
    "No window.requestAnimationFrame available"
  );
});

test("animationFrame race", () => {
  const results: number[] = [];
  expect(getFrameCallbacks()).toHaveLength(0);
  const subscription = animationFrames().subscribe((v) => results.push(v));
  let cbs: FrameRequestCallback[];
  try {
    expect(getFrameCallbacks()).toHaveLength(1);
    fakeAnimationFrame();
    cbs = getFrameCallbacks();
  } finally {
    subscription.unsubscribe();
  }
  cbs.forEach((cb) => cb(1e6));
  fakeAnimationFrame();
  expect(results).toEqual([0]);
});

test("animationFrame crash", () => {
  window.requestAnimationFrame = mockFailingRequestAnimationFrame;
  return expect(animationFrames().toPromise()).rejects.toThrow("DWEB!");
});

let animationFrameHandle = 7;
let frameHandlers: { [h: number]: FrameRequestCallback } = {};
let globalClock = 123456;
function mockRequestAnimationFrame(callback: FrameRequestCallback): number {
  const myHandle = ++animationFrameHandle;
  frameHandlers[myHandle] = callback;
  return myHandle;
}

function mockFailingRequestAnimationFrame(): number {
  throw new Error("DWEB!");
}

function mockCancelAnimationFrame(handle: number) {
  delete frameHandlers[handle];
}

function fakeAnimationFrame() {
  const myHandlers = frameHandlers;
  frameHandlers = {};
  globalClock += 20;
  for (const k in myHandlers) {
    if (Object.prototype.hasOwnProperty.call(myHandlers, k)) {
      myHandlers[k](globalClock);
    }
  }
}

function getFrameCallbacks(): FrameRequestCallback[] {
  const ret: FrameRequestCallback[] = [];
  for (const k in frameHandlers) {
    if (Object.prototype.hasOwnProperty.call(frameHandlers, k)) {
      ret.push(frameHandlers[k]);
    }
  }
  return ret;
}
