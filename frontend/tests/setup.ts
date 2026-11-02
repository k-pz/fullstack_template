import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Testing Library must load after register(); a static import would run first and break `screen`.
const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);
