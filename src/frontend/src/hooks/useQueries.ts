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

// ── Phase 7: Fixed Assets ────────────────────────────────────────────────────

export function useGetAllFixedAssets(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["fixedAssets", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getAllFixedAssets(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useCreateFixedAsset() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      companyId: bigint;
      name: string;
      category: string;
      purchaseDate: string;
      cost: number;
      salvageValue: number;
      usefulLifeYears: bigint;
      depreciationMethod: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createFixedAsset(
        args.companyId,
        args.name,
        args.category,
        BigInt(new Date(args.purchaseDate).getTime()) * 1000000n,
        args.cost,
        args.salvageValue,
        args.usefulLifeYears,
        args.depreciationMethod,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["fixedAssets", vars.companyId.toString()],
      }),
  });
}

export function useUpdateFixedAsset() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: bigint;
      name: string;
      category: string;
      purchaseDate: string;
      cost: number;
      salvageValue: number;
      usefulLifeYears: bigint;
      depreciationMethod: string;
      accumulatedDepreciation: number;
      isDisposed: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateFixedAsset(
        args.id,
        args.name,
        args.category,
        BigInt(new Date(args.purchaseDate).getTime()) * 1000000n,
        args.cost,
        args.salvageValue,
        args.usefulLifeYears,
        args.depreciationMethod,
        args.accumulatedDepreciation,
        args.isDisposed,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fixedAssets"] }),
  });
}

export function useRecordDepreciation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      assetId: bigint;
      amount: number;
      date: string;
      narration: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordDepreciation(
        args.assetId,
        args.amount,
        BigInt(new Date(args.date).getTime()) * 1000000n,
        args.narration,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixedAssets"] });
      qc.invalidateQueries({ queryKey: ["depreciationHistory"] });
    },
  });
}

export function useGetDepreciationHistory(assetId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["depreciationHistory", assetId?.toString()],
    queryFn: async () => {
      if (!actor || !assetId) return [];
      return actor.getDepreciationHistory(assetId);
    },
    enabled: !!actor && !isFetching && !!assetId,
  });
}

// ── Phase 7: Cost Centres ────────────────────────────────────────────────────

export function useGetAllCostCentres(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["costCentres", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getAllCostCentres(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useCreateCostCentre() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      companyId: bigint;
      name: string;
      parentCentreId?: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCostCentre(
        args.companyId,
        args.name,
        args.parentCentreId ?? null,
        args.description,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["costCentres", vars.companyId.toString()],
      }),
  });
}

export function useUpdateCostCentre() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: bigint;
      name: string;
      parentCentreId?: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCostCentre(
        args.id,
        args.name,
        args.parentCentreId ?? null,
        args.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["costCentres"] }),
  });
}

export function useGetCostCentreSummary(companyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["costCentreSummary", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getCostCentreSummary(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

// ── Phase 7: Multi-Currency ──────────────────────────────────────────────────

export function useGetAllCurrencies() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCurrencies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCurrency() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      code: string;
      symbol: string;
      name: string;
      exchangeRate: number;
      isBase: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCurrency(
        args.code,
        args.symbol,
        args.name,
        args.exchangeRate,
        args.isBase,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currencies"] }),
  });
}

export function useUpdateCurrency() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: bigint;
      code: string;
      symbol: string;
      name: string;
      exchangeRate: number;
      isBase: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCurrency(
        args.id,
        args.code,
        args.symbol,
        args.name,
        args.exchangeRate,
        args.isBase,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currencies"] }),
  });
}

export function useGetExchangeRates(currencyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["exchangeRates", currencyId?.toString()],
    queryFn: async () => {
      if (!actor || !currencyId) return [];
      return actor.getExchangeRates(currencyId);
    },
    enabled: !!actor && !isFetching && !!currencyId,
  });
}

export function useAddExchangeRate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      currencyId: bigint;
      date: string;
      rate: number;
      narration: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addExchangeRate(
        args.currencyId,
        BigInt(new Date(args.date).getTime()) * 1000000n,
        args.rate,
        args.narration,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["exchangeRates", vars.currencyId.toString()],
      }),
  });
}
