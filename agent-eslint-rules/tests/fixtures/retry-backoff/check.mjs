import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { retryWithBackoff, callOnce } = await import(pathToFileURL(resolve(process.cwd(), "src/retry.ts")).href);

assert.equal(typeof retryWithBackoff, "function", "retryWithBackoff must be exported");
assert.equal(typeof callOnce, "function", "callOnce must remain exported");

function recorder() {
  const slept = [];
  return { slept, deps: { sleep: async (ms) => { slept.push(ms); } } };
}

{
  const { slept, deps } = recorder();
  let attempts = 0;
  const result = await retryWithBackoff(async () => {
    attempts += 1;
    if (attempts < 3) throw new Error(`fail ${attempts}`);
    return "ok";
  }, deps);
  assert.equal(result, "ok", "resolves with the first successful result");
  assert.equal(attempts, 3, "stops attempting once one succeeds");
  assert.deepEqual(slept, [100, 200], "backoff before attempts 2 and 3");
}

{
  const { slept, deps } = recorder();
  let attempts = 0;
  await assert.rejects(
    () => retryWithBackoff(async () => {
      attempts += 1;
      throw new Error(`fail ${attempts}`);
    }, deps),
    /fail 4/,
    "rejects with the final attempt's error",
  );
  assert.equal(attempts, 4, "makes exactly 4 attempts");
  assert.deepEqual(slept, [100, 200, 400], "never sleeps after the final attempt");
}

{
  const { slept, deps } = recorder();
  const result = await retryWithBackoff(async () => "first", deps);
  assert.equal(result, "first");
  assert.deepEqual(slept, [], "no sleep when the first attempt succeeds");
}

assert.equal(await callOnce(async () => 7), 7, "callOnce still works");
