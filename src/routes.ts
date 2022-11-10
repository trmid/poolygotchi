import HomeSvelte from "./routes/Home.svelte";
import NotFoundSvelte from "./routes/NotFound.svelte";

export const routes = {
  "/": HomeSvelte,
  "*": NotFoundSvelte
};