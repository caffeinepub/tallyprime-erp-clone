// useQueries.ts - Node.js API hooks for HisabKitab Pro
import { useState, useEffect, useCallback } from 'react';
import api from '../apiClient';

// ─── Generic helpers ──────────────────────────────────────────────────────────
function useQuery<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(path);
      setData(res.data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }, [path]);
  useEffect(() => { refetch(); }, deps);
  return { data, loading, error, refetch };
}

function useMutation<T = any>(method: 'post'|'put'|'patch'|'delete', path: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (body?: any): Promise<T> => {
    setLoading(true);
    try {
      const res = method === 'delete' ? await api.delete(path) : await (api as any)[method](path, body);
      setError(null);
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e.message;
      setError(msg);
      throw new Error(msg);
    } finally { setLoading(false); }
  }, [method, path]);
  return { mutate, loading, error };
}

// ─── Company ─────────────────────────────────────────────────────────────────
export const useGetCompaniesForUser = () => useQuery('/companies');
export const useCreateCompany = () => useMutation('post', '/companies');
export const useInitializeLedgerGroups = () => useMutation('post', '/ledger-groups/initialize');

// ─── Ledger Groups ───────────────────────────────────────────────────────────
export const useGetAllLedgerGroups = (companyId?: string) =>
  useQuery('/ledger-groups' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);

// ─── Ledgers ─────────────────────────────────────────────────────────────────
export const useGetAllLedgers = (companyId?: string) =>
  useQuery('/ledgers' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);
export const useCreateLedger = () => useMutation('post', '/ledgers');
export const useUpdateLedger = (id?: string) => useMutation('put', `/ledgers/${id}`);
export const useGetTaxLedgerBalances = (companyId?: string) =>
  useQuery('/ledgers/tax-balances' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);

// ─── Vouchers ────────────────────────────────────────────────────────────────
export const useCreateVoucher = () => useMutation('post', '/vouchers');
export const useGetDayBook = (companyId?: string, from?: string, to?: string) =>
  useQuery(`/reports/day-book?company_id=${companyId}&from=${from}&to=${to}`, [companyId, from, to]);

// ─── Trial Balance ───────────────────────────────────────────────────────────
export const useGetTrialBalance = (companyId?: string) =>
  useQuery('/reports/trial-balance' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);

// ─── GST ─────────────────────────────────────────────────────────────────────
export const useGetAllGSTVouchers = (companyId?: string) =>
  useQuery('/gst/vouchers' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);
export const useCreateGSTVoucher = () => useMutation('post', '/gst/vouchers');
export const useGetGSTSettings = (companyId?: string) =>
  useQuery('/gst/settings' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);
export const useSetGSTSettings = () => useMutation('post', '/gst/settings');
export const useGetGSTR1 = (companyId?: string, from?: string, to?: string) =>
  useQuery(`/gst/gstr1?company_id=${companyId}&from=${from}&to=${to}`, [companyId, from, to]);
export const useGetGSTR3B = (companyId?: string, from?: string, to?: string) =>
  useQuery(`/gst/gstr3b?company_id=${companyId}&from=${from}&to=${to}`, [companyId, from, to]);

// ─── HSN Codes ───────────────────────────────────────────────────────────────
export const useGetAllHSNCodes = () => useQuery('/hsn-codes');
export const useCreateHSNCode = () => useMutation('post', '/hsn-codes');
export const useUpdateHSNCode = (id?: string) => useMutation('put', `/hsn-codes/${id}`);

// ─── Fixed Assets ────────────────────────────────────────────────────────────
export const useGetAllFixedAssets = (companyId?: string) =>
  useQuery('/fixed-assets' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);
export const useCreateFixedAsset = () => useMutation('post', '/fixed-assets');
export const useUpdateFixedAsset = (id?: string) => useMutation('put', `/fixed-assets/${id}`);
export const useRecordDepreciation = () => useMutation('post', '/fixed-assets/depreciation');
export const useGetDepreciationHistory = (assetId?: string) =>
  useQuery(`/fixed-assets/${assetId}/depreciation`, [assetId]);

// ─── Cost Centres ────────────────────────────────────────────────────────────
export const useGetAllCostCentres = (companyId?: string) =>
  useQuery('/cost-centres' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);
export const useCreateCostCentre = () => useMutation('post', '/cost-centres');
export const useUpdateCostCentre = (id?: string) => useMutation('put', `/cost-centres/${id}`);
export const useGetCostCentreSummary = (companyId?: string) =>
  useQuery('/cost-centres/summary' + (companyId ? `?company_id=${companyId}` : ''), [companyId]);

// ─── Currencies ──────────────────────────────────────────────────────────────
export const useGetAllCurrencies = () => useQuery('/currencies');
export const useCreateCurrency = () => useMutation('post', '/currencies');
export const useUpdateCurrency = (id?: string) => useMutation('put', `/currencies/${id}`);
export const useGetExchangeRates = (currencyId?: string) =>
  useQuery(`/currencies/${currencyId}/rates`, [currencyId]);
export const useAddExchangeRate = () => useMutation('post', '/currencies/exchange-rate');
