import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Company,
  DayBookEntry,
  GSTR1Entry,
  GSTR3BSummary,
  GSTSettings,
  GSTVoucher,
  GSTVoucherEntry,
  HSNCode,
  Ledger,
  LedgerGroup,
  TaxLedgerBalance,
  TrialBalanceEntry,
  VoucherEntry,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllCompanies() {
  const { actor, isFetching } = useActor();
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCompanies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCompany() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      name: string;
      financialYearStart: string;
      financialYearEnd: string;
      currency: string;
      gstin: string;
      address: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCompany(
        args.name,
        args.financialYearStart,
        args.financialYearEnd,
        args.currency,
        args.gstin,
        args.address,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useGetAllLedgers() {
  const { actor, isFetching } = useActor();
  return useQuery<Ledger[]>({
    queryKey: ["ledgers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLedgers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLedgerGroups() {
  const { actor, isFetching } = useActor();
  return useQuery<LedgerGroup[]>({
    queryKey: ["ledgerGroups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLedgerGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLedger() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      companyId: bigint;
      name: string;
      groupId: bigint;
      openingBalance: number;
      balanceType: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createLedger(
        args.companyId,
        args.name,
        args.groupId,
        args.openingBalance,
        args.balanceType,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ledgers"] }),
  });
}

export function useUpdateLedger() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      ledgerId: bigint;
      name: string;
      groupId: bigint;
      openingBalance: number;
      balanceType: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLedger(
        args.ledgerId,
        args.name,
        args.groupId,
        args.openingBalance,
        args.balanceType,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ledgers"] }),
  });
}

export function useCreateVoucher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      companyId: bigint;
      voucherType: string;
      voucherNumber: bigint;
      date: bigint;
      narration: string;
      entries: VoucherEntry[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createVoucher(
        args.companyId,
        args.voucherType,
        args.voucherNumber,
        args.date,
        args.narration,
        args.entries,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dayBook"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useGetTrialBalance(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<TrialBalanceEntry[]>({
    queryKey: ["trialBalance", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getTrialBalance(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useGetDayBook(companyId: bigint | null, date: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<DayBookEntry[]>({
    queryKey: ["dayBook", companyId?.toString(), date.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getDayBook(companyId, date);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useInitializeLedgerGroups() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Not connected");
      return actor.initializePredefinedLedgerGroups();
    },
  });
}

// ── GST Phase 2 ──────────────────────────────────────────────────────────────

export function useGetAllHSNCodes() {
  const { actor, isFetching } = useActor();
  return useQuery<HSNCode[]>({
    queryKey: ["hsnCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHSNCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHSNCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      code: string;
      description: string;
      gstRate: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createHSNCode(args.code, args.description, args.gstRate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hsnCodes"] }),
  });
}

export function useUpdateHSNCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: bigint;
      code: string;
      description: string;
      gstRate: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateHSNCode(
        args.id,
        args.code,
        args.description,
        args.gstRate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hsnCodes"] }),
  });
}

export function useGetGSTSettings(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<GSTSettings | null>({
    queryKey: ["gstSettings", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getGSTSettings(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useSetGSTSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      companyId: bigint;
      registrationType: string;
      stateCode: string;
      stateName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setGSTSettings(
        args.companyId,
        args.registrationType,
        args.stateCode,
        args.stateName,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["gstSettings", vars.companyId.toString()],
      }),
  });
}

export function useCreateGSTVoucher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      companyId: bigint;
      voucherType: string;
      voucherNumber: bigint;
      date: bigint;
      narration: string;
      entries: GSTVoucherEntry[];
      partyName: string;
      partyGSTIN: string;
      placeOfSupply: string;
      isInterState: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGSTVoucher(
        args.companyId,
        args.voucherType,
        args.voucherNumber,
        args.date,
        args.narration,
        args.entries,
        args.partyName,
        args.partyGSTIN,
        args.placeOfSupply,
        args.isInterState,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gstVouchers"] });
      qc.invalidateQueries({ queryKey: ["taxLedgerBalances"] });
    },
  });
}

export function useGetAllGSTVouchers(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<GSTVoucher[]>({
    queryKey: ["gstVouchers", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getAllGSTVouchers(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useGetGSTR1(
  companyId: bigint | null,
  fromDate: bigint,
  toDate: bigint,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<GSTR1Entry[]>({
    queryKey: [
      "gstr1",
      companyId?.toString(),
      fromDate.toString(),
      toDate.toString(),
    ],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getGSTR1(companyId, fromDate, toDate);
    },
    enabled: !!actor && !isFetching && !!companyId && enabled,
  });
}

export function useGetGSTR3B(
  companyId: bigint | null,
  fromDate: bigint,
  toDate: bigint,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<GSTR3BSummary | null>({
    queryKey: [
      "gstr3b",
      companyId?.toString(),
      fromDate.toString(),
      toDate.toString(),
    ],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getGSTR3B(companyId, fromDate, toDate);
    },
    enabled: !!actor && !isFetching && !!companyId && enabled,
  });
}

export function useGetTaxLedgerBalances(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<TaxLedgerBalance[]>({
    queryKey: ["taxLedgerBalances", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getTaxLedgerBalances(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}
