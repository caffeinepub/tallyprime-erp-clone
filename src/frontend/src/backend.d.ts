import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VoucherEntry {
    ledgerId: bigint;
    entryType: string;
    amount: number;
}
export type Time = bigint;
export interface GSTVoucherEntry {
    ledgerId: bigint;
    taxableAmount?: number;
    entryType: string;
    igstRate?: number;
    igstAmount?: number;
    hsnCode?: string;
    sgstRate?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    amount: number;
    cgstRate?: number;
    cessAmount?: number;
}
export interface Company {
    id: bigint;
    name: string;
    financialYearEnd: string;
    gstin: string;
    currency: string;
    address: string;
    financialYearStart: string;
}
export interface TrialBalanceEntry {
    creditTotal: number;
    debitTotal: number;
    ledgerName: string;
}
export interface Voucher {
    id: bigint;
    date: Time;
    voucherType: string;
    entries: Array<VoucherEntry>;
    voucherNumber: bigint;
    narration: string;
    companyId: bigint;
}
export interface LedgerGroup {
    id: bigint;
    isPredefined: boolean;
    nature: string;
    parentGroup?: bigint;
    name: string;
}
export interface GSTSettings {
    stateCode: string;
    stateName: string;
    registrationType: string;
    companyId: bigint;
}
export interface HSNCode {
    id: bigint;
    code: string;
    description: string;
    gstRate: number;
}
export interface GSTVoucher {
    id: bigint;
    date: Time;
    isInterState: boolean;
    voucherType: string;
    entries: Array<GSTVoucherEntry>;
    voucherNumber: bigint;
    narration: string;
    partyName: string;
    placeOfSupply: string;
    partyGSTIN: string;
    companyId: bigint;
}
export interface GSTR3BSummary {
    outwardTaxableSGST: number;
    inwardSuppliesITC: number;
    exemptSupplies: number;
    inwardCGST: number;
    outwardTaxableSupplies: number;
    inwardIGST: number;
    netCGST: number;
    inwardSGST: number;
    netIGST: number;
    netSGST: number;
    totalTaxPayable: number;
    zeroRatedSupplies: number;
    outwardTaxableCGST: number;
    outwardTaxableIGST: number;
}
export interface TaxLedgerBalance {
    totalDebits: number;
    closingBalance: number;
    ledgerName: string;
    ledgerType: string;
    openingBalance: number;
    totalCredits: number;
    taxType: string;
}
export interface GSTR1Entry {
    invoiceValue: number;
    cess: number;
    cgst: number;
    igst: number;
    taxableValue: number;
    sgst: number;
    hsnCode: string;
    invoiceDate: Time;
    invoiceNumber: bigint;
    partyName: string;
    placeOfSupply: string;
    partyGSTIN: string;
}
export interface DayBookEntry {
    voucherType: string;
    entries: Array<VoucherEntry>;
    voucherNumber: bigint;
    narration: string;
}
export interface Ledger {
    id: bigint;
    name: string;
    groupId: bigint;
    balanceType: string;
    openingBalance: number;
    companyId: bigint;
}
// Phase 4: Inventory
export interface StockGroup {
    id: bigint;
    name: string;
    parentGroupId?: bigint;
    unit: string;
}
export interface StockItem {
    id: bigint;
    companyId: bigint;
    name: string;
    stockGroupId: bigint;
    unit: string;
    openingQty: number;
    openingRate: number;
    openingValue: number;
    gstRate: number;
    hsnCode: string;
}
export interface StockVoucherEntry {
    stockItemId: bigint;
    qty: number;
    rate: number;
    amount: number;
    warehouseFrom?: string;
    warehouseTo?: string;
}
export interface StockVoucher {
    id: bigint;
    companyId: bigint;
    voucherType: string;
    voucherNumber: bigint;
    date: Time;
    narration: string;
    entries: Array<StockVoucherEntry>;
}
export interface StockSummaryEntry {
    itemId: bigint;
    itemName: string;
    unit: string;
    openingQty: number;
    openingValue: number;
    inQty: number;
    inValue: number;
    outQty: number;
    outValue: number;
    closingQty: number;
    closingValue: number;
}
export interface StockLedgerEntry {
    date: Time;
    voucherType: string;
    voucherNumber: bigint;
    narration: string;
    inQty: number;
    inValue: number;
    outQty: number;
    outValue: number;
    balance: number;
}
export interface backendInterface {
    addLedgerGroup(name: string, parentGroup: bigint | null, nature: string): Promise<LedgerGroup>;
    createCompany(name: string, financialYearStart: string, financialYearEnd: string, currency: string, gstin: string, address: string): Promise<Company>;
    createGSTVoucher(companyId: bigint, voucherType: string, voucherNumber: bigint, date: Time, narration: string, entries: Array<GSTVoucherEntry>, partyName: string, partyGSTIN: string, placeOfSupply: string, isInterState: boolean): Promise<{
        voucher: GSTVoucher;
        voucherId: bigint;
    }>;
    createHSNCode(code: string, description: string, gstRate: number): Promise<HSNCode>;
    createLedger(companyId: bigint, name: string, groupId: bigint, openingBalance: number, balanceType: string): Promise<Ledger>;
    createVoucher(companyId: bigint, voucherType: string, voucherNumber: bigint, date: Time, narration: string, entries: Array<VoucherEntry>): Promise<{
        voucher: Voucher;
        voucherId: bigint;
    }>;
    getAllCompanies(): Promise<Array<Company>>;
    getAllGSTVouchers(companyId: bigint): Promise<Array<GSTVoucher>>;
    getAllHSNCodes(): Promise<Array<HSNCode>>;
    getAllLedgerGroups(): Promise<Array<LedgerGroup>>;
    getAllLedgers(): Promise<Array<Ledger>>;
    getDayBook(companyId: bigint, date: Time): Promise<Array<DayBookEntry>>;
    getGSTR1(companyId: bigint, fromDate: Time, toDate: Time): Promise<Array<GSTR1Entry>>;
    getGSTR3B(companyId: bigint, fromDate: Time, toDate: Time): Promise<GSTR3BSummary>;
    getGSTSettings(companyId: bigint): Promise<GSTSettings | null>;
    getTaxLedgerBalances(companyId: bigint): Promise<Array<TaxLedgerBalance>>;
    getTrialBalance(companyId: bigint): Promise<Array<TrialBalanceEntry>>;
    initializePredefinedLedgerGroups(): Promise<void>;
    setGSTSettings(companyId: bigint, registrationType: string, stateCode: string, stateName: string): Promise<GSTSettings>;
    updateHSNCode(id: bigint, code: string, description: string, gstRate: number): Promise<HSNCode>;
    updateLedger(ledgerId: bigint, name: string, groupId: bigint, openingBalance: number, balanceType: string): Promise<Ledger>;
    // Phase 4: Inventory
    createStockGroup(name: string, parentGroupId: bigint | null, unit: string): Promise<StockGroup>;
    getAllStockGroups(): Promise<Array<StockGroup>>;
    createStockItem(companyId: bigint, name: string, stockGroupId: bigint, unit: string, openingQty: number, openingRate: number, gstRate: number, hsnCode: string): Promise<StockItem>;
    updateStockItem(id: bigint, name: string, stockGroupId: bigint, unit: string, openingQty: number, openingRate: number, gstRate: number, hsnCode: string): Promise<StockItem>;
    getAllStockItems(): Promise<Array<StockItem>>;
    createStockVoucher(companyId: bigint, voucherType: string, voucherNumber: bigint, date: Time, narration: string, entries: Array<StockVoucherEntry>): Promise<{
        voucherId: bigint;
        voucher: StockVoucher;
    }>;
    getAllStockVouchers(companyId: bigint): Promise<Array<StockVoucher>>;
    getStockSummary(companyId: bigint): Promise<Array<StockSummaryEntry>>;
    getStockLedger(companyId: bigint, stockItemId: bigint): Promise<Array<StockLedgerEntry>>;
}
