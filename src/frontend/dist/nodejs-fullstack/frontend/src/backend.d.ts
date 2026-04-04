import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StockItem {
    id: bigint;
    stockGroupId: bigint;
    name: string;
    unit: string;
    openingRate: number;
    hsnCode: string;
    openingValue: number;
    openingQty: number;
    gstRate: number;
    companyId: bigint;
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
export interface ChequeEntry {
    id: bigint;
    status: string;
    chequeDate: Time;
    chequeType: string;
    chequeNumber: string;
    bankAccountId: bigint;
    payeeName: string;
    voucherId?: bigint;
    amount: number;
    remarks: string;
    companyId: bigint;
}
export interface Currency {
    id: bigint;
    code: string;
    name: string;
    isBase: boolean;
    exchangeRate: number;
    symbol: string;
}
export interface BankTransaction {
    id: bigint;
    isReconciled: boolean;
    transactionType: string;
    bankAccountId: bigint;
    date: Time;
    description: string;
    voucherId?: bigint;
    amount: number;
    reconciledDate?: Time;
    companyId: bigint;
}
export interface TrialBalanceEntry {
    creditTotal: number;
    debitTotal: number;
    ledgerName: string;
}
export interface StockVoucher {
    id: bigint;
    date: Time;
    voucherType: string;
    entries: Array<StockVoucherEntry>;
    voucherNumber: bigint;
    narration: string;
    companyId: bigint;
}
export interface StockSummaryEntry {
    itemId: bigint;
    outQty: number;
    closingValue: number;
    unit: string;
    closingQty: number;
    itemName: string;
    openingValue: number;
    openingQty: number;
    inQty: number;
    inValue: number;
    outValue: number;
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
export interface Employee {
    id: bigint;
    pan: string;
    pfApplicable: boolean;
    employeeCode: string;
    bankAccount: string;
    name: string;
    designation: string;
    isActive: boolean;
    bankName: string;
    dateOfJoining: string;
    department: string;
    esiApplicable: boolean;
    companyId: bigint;
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
export interface PayrollVoucher {
    id: bigint;
    month: bigint;
    year: bigint;
    processedAt: Time;
    entries: Array<PayrollEntry>;
    companyId: bigint;
}
export interface FixedAsset {
    id: bigint;
    purchaseDate: Time;
    cost: number;
    salvageValue: number;
    name: string;
    depreciationMethod: string;
    isDisposed: boolean;
    category: string;
    usefulLifeYears: bigint;
    accumulatedDepreciation: number;
    companyId: bigint;
}
export interface BankAccount {
    id: bigint;
    linkedLedgerId: bigint;
    ifscCode: string;
    isActive: boolean;
    bankName: string;
    accountName: string;
    openingBalance: number;
    accountNumber: string;
    branchName: string;
    companyId: bigint;
}
export interface VoucherEntry {
    ledgerId: bigint;
    entryType: string;
    amount: number;
}
export interface StockVoucherEntry {
    qty: number;
    warehouseTo?: string;
    stockItemId: bigint;
    rate: number;
    warehouseFrom?: string;
    amount: number;
}
export interface StockLedgerEntry {
    outQty: number;
    balance: number;
    date: Time;
    voucherType: string;
    voucherNumber: bigint;
    narration: string;
    inQty: number;
    inValue: number;
    outValue: number;
}
export interface DepreciationEntry {
    id: bigint;
    assetId: bigint;
    date: Time;
    narration: string;
    amount: number;
}
export interface Company {
    id: bigint;
    owner: string;
    name: string;
    financialYearEnd: string;
    gstin: string;
    currency: string;
    address: string;
    financialYearStart: string;
}
export interface AppUser {
    id: bigint;
    username: string;
    createdAt: Time;
    role: string;
    isActive: boolean;
    passwordHash: string;
    companyId?: bigint;
}
export interface CostCentreSummaryEntry {
    totalAllocated: number;
    centreId: bigint;
    centreName: string;
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
export interface StockGroup {
    id: bigint;
    name: string;
    unit: string;
    parentGroupId?: bigint;
}
export interface PayrollEntry {
    da: number;
    pf: number;
    esi: number;
    hra: number;
    tds: number;
    totalDeductions: number;
    employeeName: string;
    otherAllowances: number;
    designation: string;
    netPayable: number;
    employeeId: bigint;
    basic: number;
    grossEarnings: number;
    specialAllowance: number;
    otherDeductions: number;
    department: string;
    conveyance: number;
    professionalTax: number;
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
export interface UserProfileData {
    username: string;
    displayName: string;
    themePreference: string;
    email: string;
    updatedAt: Time;
    phone: string;
}
export interface SalaryStructure {
    da: number;
    id: bigint;
    pf: number;
    esi: number;
    hra: number;
    tds: number;
    otherAllowances: number;
    employeeId: bigint;
    basic: number;
    specialAllowance: number;
    otherDeductions: number;
    conveyance: number;
    professionalTax: number;
    companyId: bigint;
}
export interface CostCentre {
    id: bigint;
    name: string;
    description: string;
    parentCentreId?: bigint;
    companyId: bigint;
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
export interface ExchangeRateEntry {
    id: bigint;
    date: Time;
    rate: number;
    narration: string;
    currencyId: bigint;
}
export interface Ledger {
    id: bigint;
    name: string;
    groupId: bigint;
    balanceType: string;
    openingBalance: number;
    companyId: bigint;
}
export interface CostAllocation {
    id: bigint;
    ledgerId: bigint;
    date: Time;
    narration: string;
    costCentreId: bigint;
    voucherId: bigint;
    amount: number;
    companyId: bigint;
}
export interface backendInterface {
    addExchangeRate(currencyId: bigint, date: Time, rate: number, narration: string): Promise<ExchangeRateEntry>;
    addLedgerGroup(name: string, parentGroup: bigint | null, nature: string): Promise<LedgerGroup>;
    changePassword(id: bigint, newPasswordHash: string): Promise<boolean>;
    createBankAccount(companyId: bigint, accountName: string, accountNumber: string, ifscCode: string, bankName: string, branchName: string, linkedLedgerId: bigint, openingBalance: number): Promise<BankAccount>;
    createBankTransaction(companyId: bigint, bankAccountId: bigint, date: Time, description: string, amount: number, transactionType: string, voucherId: bigint | null): Promise<BankTransaction>;
    createChequeEntry(companyId: bigint, bankAccountId: bigint, chequeNumber: string, chequeDate: Time, amount: number, payeeName: string, chequeType: string, remarks: string): Promise<ChequeEntry>;
    createCompany(name: string, financialYearStart: string, financialYearEnd: string, currency: string, gstin: string, address: string, owner: string): Promise<Company>;
    createCostAllocation(companyId: bigint, costCentreId: bigint, voucherId: bigint, ledgerId: bigint, amount: number, date: Time, narration: string): Promise<CostAllocation>;
    createCostCentre(companyId: bigint, name: string, parentCentreId: bigint | null, description: string): Promise<CostCentre>;
    createCurrency(code: string, symbol: string, name: string, exchangeRate: number, isBase: boolean): Promise<Currency>;
    createEmployee(companyId: bigint, name: string, employeeCode: string, department: string, designation: string, dateOfJoining: string, pan: string, bankAccount: string, bankName: string, pfApplicable: boolean, esiApplicable: boolean): Promise<Employee>;
    createFixedAsset(companyId: bigint, name: string, category: string, purchaseDate: Time, cost: number, salvageValue: number, usefulLifeYears: bigint, depreciationMethod: string): Promise<FixedAsset>;
    createGSTVoucher(companyId: bigint, voucherType: string, voucherNumber: bigint, date: Time, narration: string, entries: Array<GSTVoucherEntry>, partyName: string, partyGSTIN: string, placeOfSupply: string, isInterState: boolean): Promise<{
        voucher: GSTVoucher;
        voucherId: bigint;
    }>;
    createHSNCode(code: string, description: string, gstRate: number): Promise<HSNCode>;
    createLedger(companyId: bigint, name: string, groupId: bigint, openingBalance: number, balanceType: string): Promise<Ledger>;
    createPayrollVoucher(companyId: bigint, month: bigint, year: bigint, entries: Array<PayrollEntry>): Promise<PayrollVoucher>;
    createStockGroup(name: string, parentGroupId: bigint | null, unit: string): Promise<StockGroup>;
    createStockItem(companyId: bigint, name: string, stockGroupId: bigint, unit: string, openingQty: number, openingRate: number, gstRate: number, hsnCode: string): Promise<StockItem>;
    createStockVoucher(companyId: bigint, voucherType: string, voucherNumber: bigint, date: Time, narration: string, entries: Array<StockVoucherEntry>): Promise<{
        voucher: StockVoucher;
        voucherId: bigint;
    }>;
    createUser(username: string, passwordHash: string, role: string, companyId: bigint | null): Promise<AppUser>;
    createVoucher(companyId: bigint, voucherType: string, voucherNumber: bigint, date: Time, narration: string, entries: Array<VoucherEntry>): Promise<{
        voucher: Voucher;
        voucherId: bigint;
    }>;
    deleteUser(id: bigint): Promise<boolean>;
    exportAllData(): Promise<string>;
    getAllBankAccounts(companyId: bigint): Promise<Array<BankAccount>>;
    getAllCheques(companyId: bigint): Promise<Array<ChequeEntry>>;
    getAllCompanies(): Promise<Array<Company>>;
    getAllCostCentres(companyId: bigint): Promise<Array<CostCentre>>;
    getAllCurrencies(): Promise<Array<Currency>>;
    getAllEmployees(companyId: bigint): Promise<Array<Employee>>;
    getAllFixedAssets(companyId: bigint): Promise<Array<FixedAsset>>;
    getAllGSTVouchers(companyId: bigint): Promise<Array<GSTVoucher>>;
    getAllHSNCodes(): Promise<Array<HSNCode>>;
    getAllLedgerGroups(): Promise<Array<LedgerGroup>>;
    getAllLedgers(): Promise<Array<Ledger>>;
    getAllPayrollVouchers(companyId: bigint): Promise<Array<PayrollVoucher>>;
    getAllSalaryStructures(companyId: bigint): Promise<Array<SalaryStructure>>;
    getAllStockGroups(): Promise<Array<StockGroup>>;
    getAllStockItems(): Promise<Array<StockItem>>;
    getAllStockVouchers(companyId: bigint): Promise<Array<StockVoucher>>;
    getAllUsers(): Promise<Array<AppUser>>;
    getBankBalance(companyId: bigint, bankAccountId: bigint): Promise<number>;
    getBankStatement(companyId: bigint, bankAccountId: bigint, fromDate: Time, toDate: Time): Promise<Array<BankTransaction>>;
    getBankTransactions(companyId: bigint, bankAccountId: bigint): Promise<Array<BankTransaction>>;
    getChequesByBankAccount(companyId: bigint, bankAccountId: bigint): Promise<Array<ChequeEntry>>;
    getCompaniesForUser(username: string): Promise<Array<Company>>;
    getCostCentreSummary(companyId: bigint): Promise<Array<CostCentreSummaryEntry>>;
    getDataSummary(): Promise<{
        gstVouchers: bigint;
        employees: bigint;
        bankAccounts: bigint;
        vouchers: bigint;
        ledgers: bigint;
        stockItems: bigint;
        companies: bigint;
    }>;
    getDayBook(companyId: bigint, date: Time): Promise<Array<DayBookEntry>>;
    getDepreciationHistory(assetId: bigint): Promise<Array<DepreciationEntry>>;
    getExchangeRates(currencyId: bigint): Promise<Array<ExchangeRateEntry>>;
    getGSTR1(companyId: bigint, fromDate: Time, toDate: Time): Promise<Array<GSTR1Entry>>;
    getGSTR3B(companyId: bigint, fromDate: Time, toDate: Time): Promise<GSTR3BSummary>;
    getGSTSettings(companyId: bigint): Promise<GSTSettings | null>;
    getLatestRate(currencyCode: string): Promise<number | null>;
    getPayrollVoucher(companyId: bigint, month: bigint, year: bigint): Promise<PayrollVoucher | null>;
    getSalaryStructure(companyId: bigint, employeeId: bigint): Promise<SalaryStructure | null>;
    getStockLedger(companyId: bigint, stockItemId: bigint): Promise<Array<StockLedgerEntry>>;
    getStockSummary(companyId: bigint): Promise<Array<StockSummaryEntry>>;
    getTaxLedgerBalances(companyId: bigint): Promise<Array<TaxLedgerBalance>>;
    getTrialBalance(companyId: bigint): Promise<Array<TrialBalanceEntry>>;
    getUnreconciledTransactions(companyId: bigint, bankAccountId: bigint): Promise<Array<BankTransaction>>;
    getUserProfile(username: string): Promise<UserProfileData | null>;
    initializePredefinedLedgerGroups(): Promise<void>;
    reconcileTransaction(transactionId: bigint, voucherId: bigint | null, remarks: string): Promise<BankTransaction>;
    recordDepreciation(assetId: bigint, amount: number, date: Time, narration: string): Promise<DepreciationEntry>;
    saveSalaryStructure(companyId: bigint, employeeId: bigint, basic: number, hra: number, da: number, conveyance: number, specialAllowance: number, otherAllowances: number, pf: number, esi: number, tds: number, professionalTax: number, otherDeductions: number): Promise<SalaryStructure>;
    saveUserProfile(username: string, displayName: string, email: string, phone: string, themePreference: string): Promise<UserProfileData>;
    setGSTSettings(companyId: bigint, registrationType: string, stateCode: string, stateName: string): Promise<GSTSettings>;
    unreconcileTransaction(transactionId: bigint): Promise<BankTransaction>;
    updateBankAccount(id: bigint, accountName: string, accountNumber: string, ifscCode: string, bankName: string, branchName: string, linkedLedgerId: bigint, openingBalance: number, isActive: boolean): Promise<BankAccount>;
    updateChequeStatus(id: bigint, status: string, remarks: string): Promise<ChequeEntry>;
    updateCostCentre(id: bigint, name: string, parentCentreId: bigint | null, description: string): Promise<CostCentre>;
    updateCurrency(id: bigint, code: string, symbol: string, name: string, exchangeRate: number, isBase: boolean): Promise<Currency>;
    updateEmployee(id: bigint, name: string, employeeCode: string, department: string, designation: string, dateOfJoining: string, pan: string, bankAccount: string, bankName: string, pfApplicable: boolean, esiApplicable: boolean, isActive: boolean): Promise<Employee>;
    updateFixedAsset(id: bigint, name: string, category: string, purchaseDate: Time, cost: number, salvageValue: number, usefulLifeYears: bigint, depreciationMethod: string, accumulatedDepreciation: number, isDisposed: boolean): Promise<FixedAsset>;
    updateHSNCode(id: bigint, code: string, description: string, gstRate: number): Promise<HSNCode>;
    updateLedger(ledgerId: bigint, name: string, groupId: bigint, openingBalance: number, balanceType: string): Promise<Ledger>;
    updateStockItem(id: bigint, name: string, stockGroupId: bigint, unit: string, openingQty: number, openingRate: number, gstRate: number, hsnCode: string): Promise<StockItem>;
    updateUser(id: bigint, username: string, role: string, companyId: bigint | null, isActive: boolean): Promise<AppUser>;
    validateAllData(): Promise<Array<string>>;
    verifyUser(username: string, passwordHash: string): Promise<AppUser | null>;
}
