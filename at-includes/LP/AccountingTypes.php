<?php


class AccountingPriority {
	public $CustomerImport = 1,
			$VendorImport = 2,
			$ARInvoiceImport = 3,
			$APVoucherImport = 4;
}

class AccountingScreenNumber{
	const CustomerMaintenance = '0826000',
			VendorMaintenance = '0327000',
			ARInvoiceAndMemo = '0801000',
			APVoucherAdjustmentEntry = '0301000';
}

class AccountingVendorStatus{
	public $Active = 'Active',
			$Hold = 'Hold',
			$OneTime = 'One Time';
}

class AccountingVendorCorrectionNotice{
	public $None = 'None',
			$Once = 'Once',
			$Twice = 'Twice';
}

class APDocumentType {
	public $Voucher = 'Voucher',
			$DebitAdjustment = 'Debit Adjustment',
			$CreditAdjustment = 'Credit Adjustment';
}

class ARDocumentType {
	public $Invoice = 'Invoice',
			$CreditMemo = 'Credit Memo',
			$DebitMemo = 'Debit Memo',
			$CashSale = 'Cash Sale';
}

class APBox1099 {
	
	private static $a = array(
		'1'   => 'Rents',
		'2'   => 'Royalties',
		'3'   => 'Other Income',
		'4'   => 'Federal Income Tax Withheld',
		'5'   => 'Fishing Boat Proceeds',
		'6'   => 'Medical and Health Care Payments',
		'7'   => 'Nonemployee Compensation',
		'8'   => 'Payments in Lieu of Dividends/Interest',
		'10'  => 'Crop Insurance Proceeds',
		'13'  => 'Excess Golden Parachute Payments',
		'14'  => 'Gross Proceeds Paid to an Attorney', 
		'15a' => 'Section 409A Deferrals',
		'15b' => 'Section 409A Income'
	);
	
	public static $default = 3; //Other income.
	
	public static function values() {
		return self::$a;
	}
}

class AccountingTermsTypes {
	const Customer = 'C',
			Both = 'B',
			Vendor = 'V';
}

class LP_AccountingTypes{
	
	private static $ProductionDB = 'ProdAATAPP.dbo';
	private static $TestDB = 'TestAATAPP.dbo';
	
	public static function Box1099() { return new APBox1099(); }
	
	public static function APDocumentType() { return new APDocumentType(); }
	
	public static function ARDocumentType() { return new ARDocumentType(); }
	
	public static function VendorCorrectionNotice() { return new AccountingVendorCorrectionNotice(); }
	
	public static function VendorStatus() { return new AccountingVendorStatus(); }
	
	public static function Priority() { return new AccountingPriority(); }
	
	public static function Terms($type){
		if ( !in_array($type, array(AccountingTermsTypes::Both, AccountingTermsTypes::Customer, AccountingTermsTypes::Vendor) ) ) return false;
		
		$s = "SELECT * FROM " . self::$ProductionDB . ".Terms WHERE ApplyTo = '$type' OR ApplyTo = '" . AccountingTermsTypes::Both . "'";
		
		$a = LP_Db::fetchAll($s);
		
		$aTerms = array();
		foreach ($a as $term) {
			$aTerms[strval($term['TermsId'])] = (object)$term;
		}
		return $aTerms;
	}
	
	public static function TermsByInterval($nInterval, $sApplyTo=AccountingTermsTypes::Both) {
		if ( !in_array($sApplyTo, array(AccountingTermsTypes::Both, AccountingTermsTypes::Customer, AccountingTermsTypes::Vendor) ) ) return false;
		
		$a = self::Terms($sApplyTo);
		foreach ($a as $term) {
			if ($term->DiscIntrv == $nInterval) return $term;
		}
		
		return false;
	}
	
	public static function CustomerClass() {
		
	}
	
	public static function States() {
		$s = "SELECT StateProvId, Descr FROM " . self::$ProductionDB . ".State";
		
		$a = LP_Db::fetchAll($s);
		$aStates = array();
		foreach($a as $state) {
			$aStates[trim(strval($state['StateProvId']))] = $state['Descr'];
		}
		
		return $aStates;
	}
	
	public static function Countries() {
		$s = "SELECT CountryID, Descr FROM " . self::$ProductionDB . ".Country";
		
		$a = LP_Db::fetchAll($s);
		$aCountries = array();
		foreach($a as $country) {
			$aCountries[trim(strval($country['CountryID']))] = $country['Descr'];
		}
		
		return $aCountries;
	}
	
	public static function listAccounts(){
		
		$s = "SELECT Acct, Descr FROM ProdAATAPP.dbo.Account
			WHERE Acct IN ('40010', '41010', '45010', '52010', '51010', '55010')";
		return LP_Db::fetchAll($s);
	}
	
	public static function listSubAccounts(){
		
		$s = "SELECT Sub, Descr FROM ProdAATAPP.dbo.SubAcct";
		return LP_Db::fetchAll($s);
	}
}