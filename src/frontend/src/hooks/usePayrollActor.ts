import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

/**
 * Returns the actor cast to the full backendInterface (including Phase 5 payroll methods).
 */
export function usePayrollActor() {
  const { actor: rawActor, isFetching } = useActor();
  return {
    actor: rawActor as unknown as backendInterface | null,
    isFetching,
  };
}
