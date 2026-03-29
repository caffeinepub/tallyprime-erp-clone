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

  var nextCompanyId = 1;
  var nextLedgerGroupId = 1;
  var nextLedgerId = 1;
  var nextVoucherId = 1;
  var nextHSNCodeId = 1;
  var nextStockGroupId = 1;
  var nextStockItemId = 1;
  var nextStockVoucherId = 1;

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

  public shared ({ caller }) func createVoucher(companyId : Nat, voucherType : Text, voucherNumber : Nat, date : Time.Time, narration : Text, entries : [VoucherEntry]) : async {
    voucherId : Nat;
    voucher : Voucher;
  } {
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
    gstVouchers.values().filter(func(v) { v.companyId == companyId and v.voucherType == "Sales" and v.date >= fromDate and v.date <= toDate }).map(
      func(v) {
        let totalTaxableValue = v.entries.map(func(e) { switch (e.taxableAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });

        let totalCGST = v.entries.map(func(e) { switch (e.cgstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
        let totalSGST = v.entries.map(func(e) { switch (e.sgstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
        let totalIGST = v.entries.map(func(e) { switch (e.igstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
        let totalCess = v.entries.map(func(e) { switch (e.cessAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });

        {
          invoiceNumber = v.voucherNumber;
          invoiceDate = v.date;
          partyName = v.partyName;
          partyGSTIN = v.partyGSTIN;
          placeOfSupply = v.placeOfSupply;
          invoiceValue = totalTaxableValue + totalCGST + totalSGST + totalIGST + totalCess;
          taxableValue = totalTaxableValue;
          cgst = totalCGST;
          sgst = totalSGST;
          igst = totalIGST;
          cess = totalCess;
          hsnCode = switch (v.entries[0].hsnCode) { case (?code) { code }; case (null) { "" } };
        };
      }
    ).toArray();
  };

  public query ({ caller }) func getGSTR3B(companyId : Nat, fromDate : Time.Time, toDate : Time.Time) : async GSTR3BSummary {
    let filteredVouchers = gstVouchers.values().toArray().filter(
      func(v) {
        v.companyId == companyId and v.date >= fromDate and v.date <= toDate;
      }
    );

    var outwardTaxableSupplies = 0.0;
    var outwardTaxableIGST = 0.0;
    var outwardTaxableCGST = 0.0;
    var outwardTaxableSGST = 0.0;
    var zeroRatedSupplies = 0.0;
    var exemptSupplies = 0.0;
    var inwardSuppliesITC = 0.0;
    var inwardIGST = 0.0;
    var inwardCGST = 0.0;
    var inwardSGST = 0.0;

    filteredVouchers.forEach(
      func(v) {
        switch (v.voucherType) {
          case ("Sales") {
            if (v.isInterState) {
              outwardTaxableIGST += v.entries.map(func(e) { switch (e.igstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
              outwardTaxableSupplies += v.entries.map(func(e) { switch (e.taxableAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
            } else {
              outwardTaxableCGST += v.entries.map(func(e) { switch (e.cgstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
              outwardTaxableSGST += v.entries.map(func(e) { switch (e.sgstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
              outwardTaxableSupplies += v.entries.map(func(e) { switch (e.taxableAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
            };
          };
          case ("Purchase") {
            inwardIGST += v.entries.map(func(e) { switch (e.igstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
            inwardCGST += v.entries.map(func(e) { switch (e.cgstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
            inwardSGST += v.entries.map(func(e) { switch (e.sgstAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
            inwardSuppliesITC += v.entries.map(func(e) { switch (e.taxableAmount) { case (?amount) { amount }; case (null) { 0.0 } } }).foldLeft(0.0, func(acc, amount) { acc + amount });
          };
          case (_) {};
        };
      }
    );

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
        if (ledger.name.toLower().contains(#text("tax")) or ledger.name.toLower().contains(#text("gst")) or ledger.name.toLower().contains(#text("sgst")) or ledger.name.toLower().contains(#text("cgst")) or ledger.name.toLower().contains(#text("igst"))) {
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
};
