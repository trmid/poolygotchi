import { writable } from "svelte/store";
import type { RouteDetailLoaded } from "svelte-spa-router";

import AboutSvelte from "./routes/About.svelte";
import NotFoundSvelte from "./routes/NotFound.svelte";

export const routes = {
  "/": AboutSvelte,
  "/about": AboutSvelte,
  "*": NotFoundSvelte
};

export const page = writable<RouteDetailLoaded | null>(null);