import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Float "mo:core/Float";



actor {
  type Company = {
    id : Nat;
    name : Text;
    financialYearStart : Text;
    financialYearEnd : Text;
    currency : Text;
    gstin : Text;
    address : Text;
  };

  module Company {
    public func compare(company1 : Company, company2 : Company) : Order.Order {
      Nat.compare(company1.id, company2.id);
    };
  };

  type LedgerGroup = {
    id : Nat;
    name : Text;
    parentGroup : ?Nat;
    nature : Text;
    isPredefined : Bool;
  };

  module LedgerGroup {
    public func compare(group1 : LedgerGroup, group2 : LedgerGroup) : Order.Order {
      Nat.compare(group1.id, group2.id);
    };
  };

  type Ledger = {
    id : Nat;
    companyId : Nat;
    name : Text;
    groupId : Nat;
    openingBalance : Float;
    balanceType : Text;
  };

  module Ledger {
    public func compare(ledger1 : Ledger, ledger2 : Ledger) : Order.Order {
      Nat.compare(ledger1.id, ledger2.id);
    };
  };

  type VoucherEntry = {
    ledgerId : Nat;
    amount : Float;
    entryType : Text;
  };

  type Voucher = {
    id : Nat;
    companyId : Nat;
    voucherType : Text;
    voucherNumber : Nat;
    date : Time.Time;
    narration : Text;
    entries : [VoucherEntry];
  };

  module Voucher {
    public func compare(voucher1 : Voucher, voucher2 : Voucher) : Order.Order {
      Int.compare(voucher1.date, voucher2.date);
    };
  };

  type TrialBalanceEntry = {
    ledgerName : Text;
    debitTotal : Float;
    creditTotal : Float;
  };

  type DayBookEntry = {
    voucherType : Text;
    voucherNumber : Nat;
    narration : Text;
    entries : [VoucherEntry];
  };

  type HSNCode = {
    id : Nat;
    code : Text;
    description : Text;
    gstRate : Float;
  };

  module HSNCode {
    public func compare(hsnCode1 : HSNCode, hsnCode2 : HSNCode) : Order.Order {
      Nat.compare(hsnCode1.id, hsnCode2.id);
    };
  };

  type GSTSettings = {
    companyId : Nat;
    registrationType : Text;
    stateCode : Text;
    stateName : Text;
  };

  type GSTVoucherEntry = {
    ledgerId : Nat;
    amount : Float;
    entryType : Text;
    hsnCode : ?Text;
    taxableAmount : ?Float;
    cgstRate : ?Float;
    sgstRate : ?Float;
    igstRate : ?Float;
    cgstAmount : ?Float;
    sgstAmount : ?Float;
    igstAmount : ?Float;
    cessAmount : ?Float;
  };

  type GSTVoucher = {
    id : Nat;
    companyId : Nat;
    voucherType : Text;
    voucherNumber : Nat;
    date : Time.Time;
    narration : Text;
    entries : [GSTVoucherEntry];
    partyName : Text;
    partyGSTIN : Text;
    placeOfSupply : Text;
    isInterState : Bool;
  };

  module GSTVoucher {
    public func compare(voucher1 : GSTVoucher, voucher2 : GSTVoucher) : Order.Order {
      Int.compare(voucher1.date, voucher2.date);
    };
  };

  type GSTR1Entry = {
    invoiceNumber : Nat;
    invoiceDate : Time.Time;
    partyName : Text;
    partyGSTIN : Text;
    placeOfSupply : Text;
    invoiceValue : Float;
    taxableValue : Float;
    cgst : Float;
    sgst : Float;
    igst : Float;
    cess : Float;
    hsnCode : Text;
  };

  type GSTR3BSummary = {
    outwardTaxableSupplies : Float;
    outwardTaxableIGST : Float;
    outwardTaxableCGST : Float;
    outwardTaxableSGST : Float;
    zeroRatedSupplies : Float;
    exemptSupplies : Float;
    inwardSuppliesITC : Float;
    inwardIGST : Float;
    inwardCGST : Float;
    inwardSGST : Float;
    netIGST : Float;
    netCGST : Float;
    netSGST : Float;
    totalTaxPayable : Float;
  };

  type TaxLedgerBalance = {
    ledgerName : Text;
    ledgerType : Text;
    taxType : Text;
    openingBalance : Float;
    totalDebits : Float;
    totalCredits : Float;
    closingBalance : Float;
  };

  // PHASE 4: Inventory types
  type StockGroup = {
    id : Nat;
    name : Text;
    parentGroupId : ?Nat;
    unit : Text;
  };

  module StockGroup {
    public func compare(a : StockGroup, b : StockGroup) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type StockItem = {
    id : Nat;
    companyId : Nat;
    name : Text;
    stockGroupId : Nat;
    unit : Text;
    openingQty : Float;
    openingRate : Float;
    openingValue : Float;
    gstRate : Float;
    hsnCode : Text;
  };

  module StockItem {
    public func compare(a : StockItem, b : StockItem) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type StockVoucherEntry = {
    stockItemId : Nat;
    qty : Float;
    rate : Float;
    amount : Float;
    warehouseFrom : ?Text;
    warehouseTo : ?Text;
  };

  type StockVoucher = {
    id : Nat;
    companyId : Nat;
    voucherType : Text;
    voucherNumber : Nat;
    date : Time.Time;
    narration : Text;
    entries : [StockVoucherEntry];
  };

  module StockVoucher {
    public func compare(a : StockVoucher, b : StockVoucher) : Order.Order {
      Int.compare(a.date, b.date);
    };
  };

  type StockSummaryEntry = {
    itemId : Nat;
    itemName : Text;
    unit : Text;
    openingQty : Float;
    openingValue : Float;
    inQty : Float;
    inValue : Float;
    outQty : Float;
    outValue : Float;
    closingQty : Float;
    closingValue : Float;
  };

  type StockLedgerEntry = {
    date : Time.Time;
    voucherType : Text;
    voucherNumber : Nat;
    narration : Text;
    inQty : Float;
    inValue : Float;
    outQty : Float;
    outValue : Float;
    balance : Float;
  };

  // PHASE 5: Payroll types
  type Employee = {
    id : Nat;
    companyId : Nat;
    name : Text;
    employeeCode : Text;
    department : Text;
    designation : Text;
    dateOfJoining : Text;
    pan : Text;
    bankAccount : Text;
    bankName : Text;
    pfApplicable : Bool;
    esiApplicable : Bool;
    isActive : Bool;
  };

  module Employee {
    public func compare(a : Employee, b : Employee) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type SalaryStructure = {
    id : Nat;
    companyId : Nat;
    employeeId : Nat;
    basic : Float;
    hra : Float;
    da : Float;
    conveyance : Float;
    specialAllowance : Float;
    otherAllowances : Float;
    pf : Float;
    esi : Float;
    tds : Float;
    professionalTax : Float;
    otherDeductions : Float;
  };

  module SalaryStructure {
    public func compare(a : SalaryStructure, b : SalaryStructure) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type PayrollEntry = {
    employeeId : Nat;
    employeeName : Text;
    department : Text;
    designation : Text;
    basic : Float;
    hra : Float;
    da : Float;
    conveyance : Float;
    specialAllowance : Float;
    otherAllowances : Float;
    grossEarnings : Float;
    pf : Float;
    esi : Float;
    tds : Float;
    professionalTax : Float;
    otherDeductions : Float;
    totalDeductions : Float;
    netPayable : Float;
  };

  type PayrollVoucher = {
    id : Nat;
    companyId : Nat;
    month : Nat;
    year : Nat;
    entries : [PayrollEntry];
    processedAt : Time.Time;
  };

  module PayrollVoucher {
    public func compare(a : PayrollVoucher, b : PayrollVoucher) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // PHASE 6: Banking Module Types
  type BankAccount = {
    id : Nat;
    companyId : Nat;
    accountName : Text;
    accountNumber : Text;
    ifscCode : Text;
    bankName : Text;
    branchName : Text;
    linkedLedgerId : Nat;
    openingBalance : Float;
    isActive : Bool;
  };

  module BankAccount {
    public func compare(a : BankAccount, b : BankAccount) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type ChequeEntry = {
    id : Nat;
    companyId : Nat;
    bankAccountId : Nat;
    chequeNumber : Text;
    chequeDate : Time.Time;
    amount : Float;
    payeeName : Text;
    chequeType : Text;
    status : Text;
    voucherId : ?Nat;
    remarks : Text;
  };

  module ChequeEntry {
    public func compare(a : ChequeEntry, b : ChequeEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type BankTransaction = {
    id : Nat;
    companyId : Nat;
    bankAccountId : Nat;
    date : Time.Time;
    description : Text;
    amount : Float;
    transactionType : Text;
    voucherId : ?Nat;
    isReconciled : Bool;
    reconciledDate : ?Time.Time;
  };

  module BankTransaction {
    public func compare(a : BankTransaction, b : BankTransaction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type BankReconciliationEntry = {
    bankTransactionId : Nat;
    voucherId : ?Nat;
    reconciledDate : Time.Time;
    remarks : Text;
  };

  var nextCompanyId = 1;
  var nextLedgerGroupId = 1;
  var nextLedgerId = 1;
  var nextVoucherId = 1;
  var nextHSNCodeId = 1;
  var nextStockGroupId = 1;
  var nextStockItemId = 1;
  var nextStockVoucherId = 1;
  var nextEmployeeId = 1;
  var nextSalaryStructureId = 1;
  var nextPayrollVoucherId = 1;
  var nextBankAccountId = 1;
  var nextChequeEntryId = 1;
  var nextBankTransactionId = 1;

  let companies = Map.empty<Nat, Company>();
  let ledgerGroups = Map.empty<Nat, LedgerGroup>();
  let ledgers = Map.empty<Nat, Ledger>();
  let vouchers = Map.empty<Nat, Voucher>();
  let hsnCodes = Map.empty<Nat, HSNCode>();
  let gstSettingsMap = Map.empty<Nat, GSTSettings>();
  let gstVouchers = Map.empty<Nat, GSTVoucher>();
  let stockGroups = Map.empty<Nat, StockGroup>();
  let stockItems = Map.empty<Nat, StockItem>();
  let stockVouchers = Map.empty<Nat, StockVoucher>();
  let employees = Map.empty<Nat, Employee>();
  let salaryStructures = Map.empty<Nat, SalaryStructure>();
  let payrollVouchers = Map.empty<Nat, PayrollVoucher>();
  let bankAccounts = Map.empty<Nat, BankAccount>();
  let chequeEntries = Map.empty<Nat, ChequeEntry>();
  let bankTransactions = Map.empty<Nat, BankTransaction>();

  // PHASE 1 NON-GST FUNCTIONS
  public shared ({ caller }) func createCompany(name : Text, financialYearStart : Text, financialYearEnd : Text, currency : Text, gstin : Text, address : Text) : async Company {
    let company : Company = {
      id = nextCompanyId;
      name;
      financialYearStart;
      financialYearEnd;
      currency;
      gstin;
      address;
    };
    companies.add(nextCompanyId, company);
    nextCompanyId += 1;
    company;
  };

  public query ({ caller }) func getAllCompanies() : async [Company] {
    companies.values().toArray().sort();
  };

  public shared ({ caller }) func addLedgerGroup(name : Text, parentGroup : ?Nat, nature : Text) : async LedgerGroup {
    let ledgerGroup : LedgerGroup = {
      id = nextLedgerGroupId;
      name;
      parentGroup;
      nature;
      isPredefined = false;
    };
    ledgerGroups.add(nextLedgerGroupId, ledgerGroup);
    nextLedgerGroupId += 1;
    ledgerGroup;
  };

  public query ({ caller }) func getAllLedgerGroups() : async [LedgerGroup] {
    ledgerGroups.values().toArray().sort();
  };

  public shared ({ caller }) func createLedger(companyId : Nat, name : Text, groupId : Nat, openingBalance : Float, balanceType : Text) : async Ledger {
    let ledger : Ledger = {
      id = nextLedgerId;
      companyId;
      name;
      groupId;
      openingBalance;
      balanceType;
    };
    ledgers.add(nextLedgerId, ledger);
    nextLedgerId += 1;
    ledger;
  };

  public shared ({ caller }) func updateLedger(ledgerId : Nat, name : Text, groupId : Nat, openingBalance : Float, balanceType : Text) : async Ledger {
    switch (ledgers.get(ledgerId)) {
      case (?ledger) {
        let updatedLedger : Ledger = {
          id = ledger.id;
          companyId = ledger.companyId;
          name;
          groupId;
          openingBalance;
          balanceType;
        };
        ledgers.add(ledgerId, updatedLedger);
        updatedLedger;
      };
      case (null) { Runtime.trap("Ledger not found") };
    };
  };

  public query ({ caller }) func getAllLedgers() : async [Ledger] {
    ledgers.values().toArray().sort();
  };

  public shared ({ caller }) func createVoucher(companyId : Nat, voucherType : Text, voucherNumber : Nat, date : Time.Time, narration : Text, entries : [VoucherEntry]) : async { voucherId : Nat; voucher : Voucher } {
    let debitTotal = entries.filter(func(e) { e.entryType == "DR" }).map(func(e) { e.amount }).foldLeft(0.0, func(acc, amount) { acc + amount });
    let creditTotal = entries.filter(func(e) { e.entryType == "CR" }).map(func(e) { e.amount }).foldLeft(0.0, func(acc, amount) { acc + amount });

    if (Float.equal(debitTotal, creditTotal, 1e-8)) { Runtime.trap("Voucher is not balanced. Debits and credits must match.") };

    let voucher : Voucher = {
      id = nextVoucherId;
      companyId;
      voucherType;
      voucherNumber;
      date;
      narration;
      entries;
    };
    vouchers.add(nextVoucherId, voucher);
    let result = { voucherId = nextVoucherId; voucher };
    nextVoucherId += 1;
    result;
  };

  public query ({ caller }) func getTrialBalance(companyId : Nat) : async [TrialBalanceEntry] {
    ledgers.values().map(
      func(ledger) {
        {
          id = ledger.id;
          name = ledger.name;
          groupId = ledger.groupId;
          openingBalance = ledger.openingBalance;
          balanceType = ledger.balanceType;
        };
      }
    ).filter(func(ledger) { ledger.id == ledger.id }).toArray().map(
      func(ledger) {
        let (debitTotal, creditTotal) = vouchers.values().toArray().foldLeft(
          (0.0, 0.0),
          func(acc, voucher) {
            let (debits, credits) = voucher.entries.foldLeft(
              (0.0, 0.0),
              func(acc, entry) {
                let (dr, cr) = acc;
                (
                  dr + (if (entry.entryType == "DR") { entry.amount } else { 0.0 }),
                  cr + (if (entry.entryType == "CR") { entry.amount } else { 0.0 }),
                );
              },
            );
            (acc.0 + debits, acc.1 + credits);
          },
        );

        {
          ledgerName = ledger.name;
          debitTotal = debitTotal;
          creditTotal = creditTotal;
        };
      }
    );
  };

  public query ({ caller }) func getDayBook(companyId : Nat, date : Time.Time) : async [DayBookEntry] {
    vouchers.values().filter(
      func(voucher) {
        voucher.companyId == companyId and voucher.date == date;
      }
    ).map(
      func(voucher) {
        {
          voucherType = voucher.voucherType;
          voucherNumber = voucher.voucherNumber;
          narration = voucher.narration;
          entries = voucher.entries;
        };
      }
    ).toArray();
  };

  public shared ({ caller }) func initializePredefinedLedgerGroups() : async () {
    let predefinedGroups = [
      { name = "Assets"; parentGroup = null; nature = "DR" },
      { name = "Liabilities"; parentGroup = null; nature = "CR" },
      { name = "Income"; parentGroup = null; nature = "CR" },
      { name = "Expenses"; parentGroup = null; nature = "DR" },
      { name = "Capital"; parentGroup = ?2; nature = "CR" },
      { name = "Sales"; parentGroup = ?3; nature = "CR" },
      { name = "Purchase"; parentGroup = ?4; nature = "DR" },
      { name = "Bank"; parentGroup = ?1; nature = "DR" },
      { name = "Cash"; parentGroup = ?1; nature = "DR" },
      { name = "Debtors"; parentGroup = ?1; nature = "DR" },
      { name = "Creditors"; parentGroup = ?2; nature = "CR" },
      { name = "Tax"; parentGroup = ?2; nature = "CR" },
    ];

    for (group in predefinedGroups.values()) {
      ignore await addLedgerGroup(group.name, group.parentGroup, group.nature);
    };
  };

  // PHASE 2: GST ENABLED FUNCTIONS
  public shared ({ caller }) func createHSNCode(code : Text, description : Text, gstRate : Float) : async HSNCode {
    let hsnCode : HSNCode = {
      id = nextHSNCodeId;
      code;
      description;
      gstRate;
    };
    hsnCodes.add(nextHSNCodeId, hsnCode);
    nextHSNCodeId += 1;
    hsnCode;
  };

  public query ({ caller }) func getAllHSNCodes() : async [HSNCode] {
    hsnCodes.values().toArray().sort();
  };

  public shared ({ caller }) func updateHSNCode(id : Nat, code : Text, description : Text, gstRate : Float) : async HSNCode {
    switch (hsnCodes.get(id)) {
      case (?hsnCode) {
        let updatedHSNCode : HSNCode = {
          id = hsnCode.id;
          code;
          description;
          gstRate;
        };
        hsnCodes.add(id, updatedHSNCode);
        updatedHSNCode;
      };
      case (null) { Runtime.trap("HSN Code not found") };
    };
  };

  public shared ({ caller }) func setGSTSettings(companyId : Nat, registrationType : Text, stateCode : Text, stateName : Text) : async GSTSettings {
    let settings : GSTSettings = {
      companyId;
      registrationType;
      stateCode;
      stateName;
    };
    gstSettingsMap.add(companyId, settings);
    settings;
  };

  public query ({ caller }) func getGSTSettings(companyId : Nat) : async ?GSTSettings {
    gstSettingsMap.get(companyId);
  };

  public shared ({ caller }) func createGSTVoucher(companyId : Nat, voucherType : Text, voucherNumber : Nat, date : Time.Time, narration : Text, entries : [GSTVoucherEntry], partyName : Text, partyGSTIN : Text, placeOfSupply : Text, isInterState : Bool) : async { voucherId : Nat; voucher : GSTVoucher } {
    let voucher : GSTVoucher = {
      id = nextVoucherId;
      companyId;
      voucherType;
      voucherNumber;
      date;
      narration;
      entries;
      partyName;
      partyGSTIN;
      placeOfSupply;
      isInterState;
    };
    gstVouchers.add(nextVoucherId, voucher);
    let result = { voucherId = nextVoucherId; voucher };
    nextVoucherId += 1;
    result;
  };

  public query ({ caller }) func getAllGSTVouchers(companyId : Nat) : async [GSTVoucher] {
    gstVouchers.values().filter(func(v) { v.companyId == companyId }).toArray().sort();
  };

  public query ({ caller }) func getGSTR1(companyId : Nat, fromDate : Time.Time, toDate : Time.Time) : async [GSTR1Entry] {
    gstVouchers.values().filter(func(v) {
      v.companyId == companyId and v.date >= fromDate and v.date <= toDate and v.voucherType == "Sales"
    }).map(func(v) {
      let taxableValue = v.entries.foldLeft(0.0, func(acc, e) {
        switch (e.taxableAmount) { case (?ta) { acc + ta }; case (null) { acc } };
      });
      let cgst = v.entries.foldLeft(0.0, func(acc, e) {
        switch (e.cgstAmount) { case (?ca) { acc + ca }; case (null) { acc } };
      });
      let sgst = v.entries.foldLeft(0.0, func(acc, e) {
        switch (e.sgstAmount) { case (?sa) { acc + sa }; case (null) { acc } };
      });
      let igst = v.entries.foldLeft(0.0, func(acc, e) {
        switch (e.igstAmount) { case (?ia) { acc + ia }; case (null) { acc } };
      });
      let cess = v.entries.foldLeft(0.0, func(acc, e) {
        switch (e.cessAmount) { case (?ca) { acc + ca }; case (null) { acc } };
      });
      let hsnCode = switch (v.entries[0].hsnCode) { case (?h) { h }; case (null) { "" } };
      {
        invoiceNumber = v.voucherNumber;
        invoiceDate = v.date;
        partyName = v.partyName;
        partyGSTIN = v.partyGSTIN;
        placeOfSupply = v.placeOfSupply;
        invoiceValue = taxableValue + cgst + sgst + igst + cess;
        taxableValue;
        cgst;
        sgst;
        igst;
        cess;
        hsnCode;
      };
    }).toArray();
  };

  public query ({ caller }) func getGSTR3B(companyId : Nat, fromDate : Time.Time, toDate : Time.Time) : async GSTR3BSummary {
    let salesVouchers = gstVouchers.values().filter(func(v) {
      v.companyId == companyId and v.date >= fromDate and v.date <= toDate and v.voucherType == "Sales"
    }).toArray();
    let purchaseVouchers = gstVouchers.values().filter(func(v) {
      v.companyId == companyId and v.date >= fromDate and v.date <= toDate and v.voucherType == "Purchase"
    }).toArray();

    var outwardTaxableSupplies = 0.0;
    var outwardTaxableIGST = 0.0;
    var outwardTaxableCGST = 0.0;
    var outwardTaxableSGST = 0.0;
    var inwardSuppliesITC = 0.0;
    var inwardIGST = 0.0;
    var inwardCGST = 0.0;
    var inwardSGST = 0.0;

    salesVouchers.forEach(func(v) {
      v.entries.forEach(func(e) {
        switch (e.taxableAmount) { case (?ta) { outwardTaxableSupplies += ta }; case (null) {} };
        switch (e.igstAmount) { case (?ia) { outwardTaxableIGST += ia }; case (null) {} };
        switch (e.cgstAmount) { case (?ca) { outwardTaxableCGST += ca }; case (null) {} };
        switch (e.sgstAmount) { case (?sa) { outwardTaxableSGST += sa }; case (null) {} };
      });
    });

    purchaseVouchers.forEach(func(v) {
      v.entries.forEach(func(e) {
        switch (e.taxableAmount) { case (?ta) { inwardSuppliesITC += ta }; case (null) {} };
        switch (e.igstAmount) { case (?ia) { inwardIGST += ia }; case (null) {} };
        switch (e.cgstAmount) { case (?ca) { inwardCGST += ca }; case (null) {} };
        switch (e.sgstAmount) { case (?sa) { inwardSGST += sa }; case (null) {} };
      });
    });

    {
      outwardTaxableSupplies;
      outwardTaxableIGST;
      outwardTaxableCGST;
      outwardTaxableSGST;
      zeroRatedSupplies = 0.0;
      exemptSupplies = 0.0;
      inwardSuppliesITC;
      inwardIGST;
      inwardCGST;
      inwardSGST;
      netIGST = outwardTaxableIGST - inwardIGST;
      netCGST = outwardTaxableCGST - inwardCGST;
      netSGST = outwardTaxableSGST - inwardSGST;
      totalTaxPayable = (outwardTaxableIGST - inwardIGST) + (outwardTaxableCGST - inwardCGST) + (outwardTaxableSGST - inwardSGST);
    };
  };

  public query ({ caller }) func getTaxLedgerBalances(companyId : Nat) : async [TaxLedgerBalance] {
    ledgers.values().filter(func(l) { l.companyId == companyId }).map(
      func(ledger) {
        let isTaxLedger = ledger.name.toLower().contains(#text("gst")) or ledger.name.toLower().contains(#text("cgst")) or ledger.name.toLower().contains(#text("sgst")) or ledger.name.toLower().contains(#text("igst"));
        if (isTaxLedger) {
          let totalDebits = gstVouchers.values().toArray().foldLeft(
            0.0,
            func(acc, voucher) {
              acc + voucher.entries.filter(func(entry) { entry.ledgerId == ledger.id and entry.entryType == "DR" }).map(func(entry) { entry.amount }).foldLeft(0.0, func(acc, amount) { acc + amount });
            },
          );

          let totalCredits = gstVouchers.values().toArray().foldLeft(
            0.0,
            func(acc, voucher) {
              acc + voucher.entries.filter(func(entry) { entry.ledgerId == ledger.id and entry.entryType == "CR" }).map(func(entry) { entry.amount }).foldLeft(0.0, func(acc, amount) { acc + amount });
            },
          );

          {
            ledgerName = ledger.name;
            ledgerType = "GST";
            taxType = if (ledger.name.toLower().contains(#text("sgst"))) { "SGST" } else if (ledger.name.toLower().contains(#text("cgst"))) { "CGST" } else if (ledger.name.toLower().contains(#text("igst"))) { "IGST" } else { "OTHER" };
            openingBalance = ledger.openingBalance;
            totalDebits;
            totalCredits;
            closingBalance = ledger.openingBalance + (totalDebits - totalCredits);
          };
        } else {
          {
            ledgerName = ledger.name;
            ledgerType = "NON-GST";
            taxType = "NONE";
            openingBalance = 0.0;
            totalDebits = 0.0;
            totalCredits = 0.0;
            closingBalance = 0.0;
          };
        };
      }
    ).filter(func(balance) { balance.ledgerType == "GST" }).toArray();
  };

  // PHASE 4: INVENTORY FUNCTIONS
  public shared ({ caller }) func createStockGroup(name : Text, parentGroupId : ?Nat, unit : Text) : async StockGroup {
    let sg : StockGroup = {
      id = nextStockGroupId;
      name;
      parentGroupId;
      unit;
    };
    stockGroups.add(nextStockGroupId, sg);
    nextStockGroupId += 1;
    sg;
  };

  public query ({ caller }) func getAllStockGroups() : async [StockGroup] {
    stockGroups.values().toArray().sort();
  };

  public shared ({ caller }) func createStockItem(companyId : Nat, name : Text, stockGroupId : Nat, unit : Text, openingQty : Float, openingRate : Float, gstRate : Float, hsnCode : Text) : async StockItem {
    let item : StockItem = {
      id = nextStockItemId;
      companyId;
      name;
      stockGroupId;
      unit;
      openingQty;
      openingRate;
      openingValue = openingQty * openingRate;
      gstRate;
      hsnCode;
    };
    stockItems.add(nextStockItemId, item);
    nextStockItemId += 1;
    item;
  };

  public shared ({ caller }) func updateStockItem(id : Nat, name : Text, stockGroupId : Nat, unit : Text, openingQty : Float, openingRate : Float, gstRate : Float, hsnCode : Text) : async StockItem {
    switch (stockItems.get(id)) {
      case (?item) {
        let updated : StockItem = {
          id = item.id;
          companyId = item.companyId;
          name;
          stockGroupId;
          unit;
          openingQty;
          openingRate;
          openingValue = openingQty * openingRate;
          gstRate;
          hsnCode;
        };
        stockItems.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Stock item not found") };
    };
  };

  public query ({ caller }) func getAllStockItems() : async [StockItem] {
    stockItems.values().toArray().sort();
  };

  public shared ({ caller }) func createStockVoucher(companyId : Nat, voucherType : Text, voucherNumber : Nat, date : Time.Time, narration : Text, entries : [StockVoucherEntry]) : async { voucherId : Nat; voucher : StockVoucher } {
    let sv : StockVoucher = {
      id = nextStockVoucherId;
      companyId;
      voucherType;
      voucherNumber;
      date;
      narration;
      entries;
    };
    stockVouchers.add(nextStockVoucherId, sv);
    let result = { voucherId = nextStockVoucherId; voucher = sv };
    nextStockVoucherId += 1;
    result;
  };

  public query ({ caller }) func getAllStockVouchers(companyId : Nat) : async [StockVoucher] {
    stockVouchers.values().filter(func(v) { v.companyId == companyId }).toArray().sort();
  };

  public query ({ caller }) func getStockSummary(companyId : Nat) : async [StockSummaryEntry] {
    let companyItems = stockItems.values().filter(func(i) { i.companyId == companyId }).toArray();
    let companyVouchers = stockVouchers.values().filter(func(v) { v.companyId == companyId }).toArray();

    companyItems.map(func(item) {
      var inQty = 0.0;
      var inValue = 0.0;
      var outQty = 0.0;
      var outValue = 0.0;

      companyVouchers.forEach(func(v) {
        v.entries.filter(func(e) { e.stockItemId == item.id }).forEach(func(e) {
          if (v.voucherType == "Receipt") {
            inQty += e.qty;
            inValue += e.amount;
          } else if (v.voucherType == "Issue") {
            outQty += e.qty;
            outValue += e.amount;
          } else if (v.voucherType == "Transfer") {
            // transfer: internal movement, no net change
          };
        });
      });

      let closingQty = item.openingQty + inQty - outQty;
      let closingValue = item.openingValue + inValue - outValue;

      {
        itemId = item.id;
        itemName = item.name;
        unit = item.unit;
        openingQty = item.openingQty;
        openingValue = item.openingValue;
        inQty;
        inValue;
        outQty;
        outValue;
        closingQty;
        closingValue;
      };
    });
  };

  public query ({ caller }) func getStockLedger(companyId : Nat, stockItemId : Nat) : async [StockLedgerEntry] {
    let companyVouchers = stockVouchers.values().filter(func(v) { v.companyId == companyId }).toArray().sort();

    var runningBalance = switch (stockItems.get(stockItemId)) {
      case (?item) { item.openingQty };
      case (null) { 0.0 };
    };

    companyVouchers.map(func(v) {
      let matchingEntries = v.entries.filter(func(e) { e.stockItemId == stockItemId });
      var inQty = 0.0;
      var inValue = 0.0;
      var outQty = 0.0;
      var outValue = 0.0;

      matchingEntries.forEach(func(e) {
        if (v.voucherType == "Receipt") {
          inQty += e.qty;
          inValue += e.amount;
        } else if (v.voucherType == "Issue") {
          outQty += e.qty;
          outValue += e.amount;
        };
      });

      runningBalance := runningBalance + inQty - outQty;

      {
        date = v.date;
        voucherType = v.voucherType;
        voucherNumber = v.voucherNumber;
        narration = v.narration;
        inQty;
        inValue;
        outQty;
        outValue;
        balance = runningBalance;
      };
    }).filter(func(e) { e.inQty > 0.0 or e.outQty > 0.0 });
  };

  // PHASE 5: PAYROLL FUNCTIONS
  public shared ({ caller }) func createEmployee(companyId : Nat, name : Text, employeeCode : Text, department : Text, designation : Text, dateOfJoining : Text, pan : Text, bankAccount : Text, bankName : Text, pfApplicable : Bool, esiApplicable : Bool) : async Employee {
    let emp : Employee = {
      id = nextEmployeeId;
      companyId;
      name;
      employeeCode;
      department;
      designation;
      dateOfJoining;
      pan;
      bankAccount;
      bankName;
      pfApplicable;
      esiApplicable;
      isActive = true;
    };
    employees.add(nextEmployeeId, emp);
    nextEmployeeId += 1;
    emp;
  };

  public shared ({ caller }) func updateEmployee(id : Nat, name : Text, employeeCode : Text, department : Text, designation : Text, dateOfJoining : Text, pan : Text, bankAccount : Text, bankName : Text, pfApplicable : Bool, esiApplicable : Bool, isActive : Bool) : async Employee {
    switch (employees.get(id)) {
      case (?emp) {
        let updated : Employee = {
          id = emp.id;
          companyId = emp.companyId;
          name;
          employeeCode;
          department;
          designation;
          dateOfJoining;
          pan;
          bankAccount;
          bankName;
          pfApplicable;
          esiApplicable;
          isActive;
        };
        employees.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Employee not found") };
    };
  };

  public query ({ caller }) func getAllEmployees(companyId : Nat) : async [Employee] {
    employees.values().filter(func(e) { e.companyId == companyId }).toArray().sort();
  };

  public shared ({ caller }) func saveSalaryStructure(companyId : Nat, employeeId : Nat, basic : Float, hra : Float, da : Float, conveyance : Float, specialAllowance : Float, otherAllowances : Float, pf : Float, esi : Float, tds : Float, professionalTax : Float, otherDeductions : Float) : async SalaryStructure {
    let ss : SalaryStructure = {
      id = nextSalaryStructureId;
      companyId;
      employeeId;
      basic;
      hra;
      da;
      conveyance;
      specialAllowance;
      otherAllowances;
      pf;
      esi;
      tds;
      professionalTax;
      otherDeductions;
    };
    let existing = salaryStructures.values().filter(func(s) { s.employeeId == employeeId and s.companyId == companyId }).toArray();
    existing.forEach(func(s) { salaryStructures.remove(s.id) });
    salaryStructures.add(nextSalaryStructureId, ss);
    nextSalaryStructureId += 1;
    ss;
  };

  public query ({ caller }) func getSalaryStructure(companyId : Nat, employeeId : Nat) : async ?SalaryStructure {
    let matches = salaryStructures.values().filter(func(s) { s.employeeId == employeeId and s.companyId == companyId }).toArray();
    if (matches.size() > 0) { ?matches[0] } else { null };
  };

  public query ({ caller }) func getAllSalaryStructures(companyId : Nat) : async [SalaryStructure] {
    salaryStructures.values().filter(func(s) { s.companyId == companyId }).toArray().sort();
  };

  public shared ({ caller }) func createPayrollVoucher(companyId : Nat, month : Nat, year : Nat, entries : [PayrollEntry]) : async PayrollVoucher {
    let pv : PayrollVoucher = {
      id = nextPayrollVoucherId;
      companyId;
      month;
      year;
      entries;
      processedAt = Time.now();
    };
    payrollVouchers.add(nextPayrollVoucherId, pv);
    nextPayrollVoucherId += 1;
    pv;
  };

  public query ({ caller }) func getPayrollVoucher(companyId : Nat, month : Nat, year : Nat) : async ?PayrollVoucher {
    let matches = payrollVouchers.values().filter(func(p) { p.companyId == companyId and p.month == month and p.year == year }).toArray();
    if (matches.size() > 0) { ?matches[0] } else { null };
  };

  public query ({ caller }) func getAllPayrollVouchers(companyId : Nat) : async [PayrollVoucher] {
    payrollVouchers.values().filter(func(p) { p.companyId == companyId }).toArray().sort();
  };

  // PHASE 6: Banking Module Functions
  public shared ({ caller }) func createBankAccount(companyId : Nat, accountName : Text, accountNumber : Text, ifscCode : Text, bankName : Text, branchName : Text, linkedLedgerId : Nat, openingBalance : Float) : async BankAccount {
    let bankAccount : BankAccount = {
      id = nextBankAccountId;
      companyId;
      accountName;
      accountNumber;
      ifscCode;
      bankName;
      branchName;
      linkedLedgerId;
      openingBalance;
      isActive = true;
    };
    bankAccounts.add(nextBankAccountId, bankAccount);
    nextBankAccountId += 1;
    bankAccount;
  };

  public shared ({ caller }) func updateBankAccount(id : Nat, accountName : Text, accountNumber : Text, ifscCode : Text, bankName : Text, branchName : Text, linkedLedgerId : Nat, openingBalance : Float, isActive : Bool) : async BankAccount {
    switch (bankAccounts.get(id)) {
      case (?bankAccount) {
        let updatedBankAccount : BankAccount = {
          id = bankAccount.id;
          companyId = bankAccount.companyId;
          accountName;
          accountNumber;
          ifscCode;
          bankName;
          branchName;
          linkedLedgerId;
          openingBalance;
          isActive;
        };
        bankAccounts.add(id, updatedBankAccount);
        updatedBankAccount;
      };
      case (null) { Runtime.trap("Bank account not found") };
    };
  };

  public query ({ caller }) func getAllBankAccounts(companyId : Nat) : async [BankAccount] {
    bankAccounts.values().filter(func(b) { b.companyId == companyId }).toArray().sort();
  };

  public shared ({ caller }) func createChequeEntry(companyId : Nat, bankAccountId : Nat, chequeNumber : Text, chequeDate : Time.Time, amount : Float, payeeName : Text, chequeType : Text, remarks : Text) : async ChequeEntry {
    let chequeEntry : ChequeEntry = {
      id = nextChequeEntryId;
      companyId;
      bankAccountId;
      chequeNumber;
      chequeDate;
      amount;
      payeeName;
      chequeType;
      status = "Pending";
      voucherId = null;
      remarks;
    };
    chequeEntries.add(nextChequeEntryId, chequeEntry);
    nextChequeEntryId += 1;
    chequeEntry;
  };

  public shared ({ caller }) func updateChequeStatus(id : Nat, status : Text, remarks : Text) : async ChequeEntry {
    switch (chequeEntries.get(id)) {
      case (?chequeEntry) {
        let updatedChequeEntry : ChequeEntry = {
          id = chequeEntry.id;
          companyId = chequeEntry.companyId;
          bankAccountId = chequeEntry.bankAccountId;
          chequeNumber = chequeEntry.chequeNumber;
          chequeDate = chequeEntry.chequeDate;
          amount = chequeEntry.amount;
          payeeName = chequeEntry.payeeName;
          chequeType = chequeEntry.chequeType;
          status;
          voucherId = chequeEntry.voucherId;
          remarks;
        };
        chequeEntries.add(id, updatedChequeEntry);
        updatedChequeEntry;
      };
      case (null) { Runtime.trap("Cheque entry not found") };
    };
  };

  public query ({ caller }) func getAllCheques(companyId : Nat) : async [ChequeEntry] {
    chequeEntries.values().filter(func(c) { c.companyId == companyId }).toArray().sort();
  };

  public query ({ caller }) func getChequesByBankAccount(companyId : Nat, bankAccountId : Nat) : async [ChequeEntry] {
    chequeEntries.values().filter(func(c) { c.companyId == companyId and c.bankAccountId == bankAccountId }).toArray().sort();
  };

  public shared ({ caller }) func createBankTransaction(companyId : Nat, bankAccountId : Nat, date : Time.Time, description : Text, amount : Float, transactionType : Text, voucherId : ?Nat) : async BankTransaction {
    let bankTransaction : BankTransaction = {
      id = nextBankTransactionId;
      companyId;
      bankAccountId;
      date;
      description;
      amount;
      transactionType;
      voucherId;
      isReconciled = false;
      reconciledDate = null;
    };
    bankTransactions.add(nextBankTransactionId, bankTransaction);
    nextBankTransactionId += 1;
    bankTransaction;
  };

  public shared ({ caller }) func reconcileTransaction(transactionId : Nat, voucherId : ?Nat, remarks : Text) : async BankTransaction {
    switch (bankTransactions.get(transactionId)) {
      case (?transaction) {
        let updatedTransaction : BankTransaction = {
          id = transaction.id;
          companyId = transaction.companyId;
          bankAccountId = transaction.bankAccountId;
          date = transaction.date;
          description = transaction.description;
          amount = transaction.amount;
          transactionType = transaction.transactionType;
          voucherId;
          isReconciled = true;
          reconciledDate = ?Time.now();
        };
        bankTransactions.add(transactionId, updatedTransaction);
        updatedTransaction;
      };
      case (null) { Runtime.trap("Bank transaction not found") };
    };
  };

  public shared ({ caller }) func unreconcileTransaction(transactionId : Nat) : async BankTransaction {
    switch (bankTransactions.get(transactionId)) {
      case (?transaction) {
        let updatedTransaction : BankTransaction = {
          id = transaction.id;
          companyId = transaction.companyId;
          bankAccountId = transaction.bankAccountId;
          date = transaction.date;
          description = transaction.description;
          amount = transaction.amount;
          transactionType = transaction.transactionType;
          voucherId = transaction.voucherId;
          isReconciled = false;
          reconciledDate = null;
        };
        bankTransactions.add(transactionId, updatedTransaction);
        updatedTransaction;
      };
      case (null) { Runtime.trap("Bank transaction not found") };
    };
  };

  public query ({ caller }) func getBankTransactions(companyId : Nat, bankAccountId : Nat) : async [BankTransaction] {
    bankTransactions.values().filter(func(t) { t.companyId == companyId and t.bankAccountId == bankAccountId }).toArray().sort();
  };

  public query ({ caller }) func getUnreconciledTransactions(companyId : Nat, bankAccountId : Nat) : async [BankTransaction] {
    bankTransactions.values().filter(func(t) { t.companyId == companyId and t.bankAccountId == bankAccountId and not t.isReconciled }).toArray().sort();
  };

  public query ({ caller }) func getBankStatement(companyId : Nat, bankAccountId : Nat, fromDate : Time.Time, toDate : Time.Time) : async [BankTransaction] {
    bankTransactions.values().filter(func(t) { t.companyId == companyId and t.bankAccountId == bankAccountId and t.date >= fromDate and t.date <= toDate }).toArray().sort();
  };

  public query ({ caller }) func getBankBalance(companyId : Nat, bankAccountId : Nat) : async Float {
    let account = switch (bankAccounts.get(bankAccountId)) {
      case (?account) { account };
      case (null) { Runtime.trap("Bank account not found") };
    };
    let credits = bankTransactions.values().filter(func(t) { t.companyId == companyId and t.bankAccountId == bankAccountId and t.transactionType == "Credit" }).map(func(t) { t.amount }).foldLeft(0.0, func(acc, val) { acc + val });
    let debits = bankTransactions.values().filter(func(t) { t.companyId == companyId and t.bankAccountId == bankAccountId and t.transactionType == "Debit" }).map(func(t) { t.amount }).foldLeft(0.0, func(acc, val) { acc + val });
    account.openingBalance + credits - debits;
  };
};
