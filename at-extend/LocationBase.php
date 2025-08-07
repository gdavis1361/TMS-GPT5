<?php

/**
 * Location Base
 *
 * @author Steve Keylon
 */
class LocationBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'location_base';

	const INACTIVE_BIT = 0;
	const ACTIVE_BIT = 1;

	public function create($sName1, $sName2, $sAddress1, $sAddress2, $sAddress3, $sZip, $sSeq, $nCreatedById, $locationTypeId = 1) {

		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if (!string($sName1, TRUE) || !strlen($sName1)) {
			$this->addError('Location Name is required', 'name1');
		}
		
		if (!is_string($sAddress1) || !strlen($sAddress1)) {
			$this->addError('Address is required', 'address1');
		}
		
		if (strlen($sZip)) {
			$oGeo = new GeoData();
			$oData = $oGeo->lookup_zip($sZip);
			if ($oData === false) {
				$this->addError('Zip is invalid', 'zip');
			}
		}
		else {
			$this->addError('Zip is required', 'zip');
		}
		
		if ($this->anyErrors()) {
			return false;
		}

		$sTmpName = preg_replace('/[^a-zA-Z0-9]/', '', $sName1); //str_replace(' ', '', $sName1);
		$sTmpAbbr = strtoupper(substr($sTmpName, 0, 4) . $oData->State);
		$sAbbr = $sTmpAbbr . sprintf('%02d', ($this->count_abbr($sTmpAbbr) + 1));

		// Save Data
		$this->set_location_abbr($sAbbr);
		$this->set_location_name_1($sName1);
		$this->set_location_name_2($sName2);
		$this->set_address_1($sAddress1);
		$this->set_address_2($sAddress2);
		$this->set_address_3($sAddress3);
		$this->set_zip($sZip);
		$this->set_seq($sSeq);
		$this->set_active(1);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		$this->set('type', $locationTypeId);

		$this->save();

		// Report
		return true;
	}

	function get_zip($nLocId) {
		$oLocationBase = new LocationBase();
		$oLocationBase->where('location_id', '=', $nLocId);
		$aLocationBase = $oLocationBase->list();
		foreach ($aLocationBase->rows as $Location) {
			return $a = $Location->zip;
		}
	}

	function get_location_by_id($nId) {
		$aRet = false;
		if (!is_numeric($nId))
			return $aRet;

		if ($this->load($nId)) {
			$aRet = $this->get();
		}

		// Add City/State
		$aRet['city'] = '';
		$aRet['state'] = '';
		if (is_numeric($aRet['zip'])) {
			$oGeoData = new GeoData;
			$oZipData = $oGeoData->lookup_zip($aRet['zip']);
			$aRet['city'] = $oZipData->City;
			$aRet['state'] = $oZipData->State;
		}

		return $aRet;
	}

	function count_abbr($s) {
		$o = new LocationBase();
		$o->where('location_abbr', 'beginslike', strtoupper($s));
		$count = $o->list()->rows;
		return count($count);
	}

	function add_mode($nModeId) {
		$nId = $this->get('location_id');
		if (empty($nId))
			return false;

		$o = new LocationToModes();

		$data['location_id'] = $nId;
		$data['mode_id'] = $nModeId;

		return $o->create($data);
	}

	public static function checkName($sName) {
		$query = "SELECT * FROM location_base WHERE location_name_1 = '" . LP_Db::escape($sName) . "'";
		$row = LP_Db::fetchRow($query);
		return $row;
	}

	public function getBillingContactId() {
		$query = "SELECT contact_id FROM location_to_contact WHERE location_id = {$this->get('location_id')}";
		$row = LP_Db::fetchRow($query);
		$contactId = 0;
		if ($row) {
			$contactId = $row['contact_id'];
		}
		return $contactId;
	}

}