import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

/**
 * Returns the actor cast to the full backendInterface (including Phase 6 banking methods).
 */
export function useBankingActor() {
  const { actor: rawActor, isFetching } = useActor();
  return {
    actor: rawActor as unknown as backendInterface | null,
    isFetching,
  };
}
