/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | { url: string; revision: string | null })[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  // clientsClaim is intentionally false: skipWaiting still activates the new
  // worker immediately, but existing tabs keep their previous SW until they
  // navigate. This avoids hot-swapping assets out from under an in-progress
  // quiz/drill/radio session.
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
