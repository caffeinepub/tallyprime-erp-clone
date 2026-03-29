import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

/**
 * Returns the actor cast to the full backendInterface (including Phase 4 inventory methods).
 * The backend.ts file is auto-generated and may lag behind backend.d.ts type additions.
 */
export function useInventoryActor() {
  const { actor: rawActor, isFetching } = useActor();
  return {
    actor: rawActor as unknown as backendInterface | null,
    isFetching,
  };
}
