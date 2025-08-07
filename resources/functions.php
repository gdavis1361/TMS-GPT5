<?php

// This function returns an array with keys:
//  'first_name', 'middle_name', 'preferred_name', 'last_name'
//
// These values are based on the string name input.
//  And are meant to work well with the contact_base table
function explode_name($sName) {
	$aNameParts = explode(' ', $sName, 4);
	if (count($aNameParts) > 2) {
		$sFirstName = $aNameParts[0];
		$sMiddleName = $aNameParts[1];
		$sLastName = $aNameParts[2];
		if (substr($sMiddleName, 0, 1) == '"') {
			$sPreferredName = trim($sMiddleName, '"');
			if (count($aNameParts) > 3) {  // If there's 4 names listed, and the second starts with a quote, the second is 'preferred'
				$sMiddleName = $aNameParts[2];
				$sLastName = $aNameParts[3];
			}
			else {
				$sMiddleName = ' ';
				$sLastName = $aNameParts[2];
			}
		}
		else if (substr($sLastName, 0, 1) == '"') {
			$sPreferredName = trim($sLastName, '"');
			if (count($aNameParts) > 3) {  // If there's 4 names listed, and the third starts with a quote, the third is 'preferred'
				$sMiddleName = $aNameParts[1];
				$sLastName = $aNameParts[3];
			}
			else {
				$sMiddleName = ' ';
				$sLastName = $aNameParts[1];
			}
		}
	}
	else if (count($aNameParts) > 1) {
		$sFirstName = $aNameParts[0];
		$sMiddleName = ' ';
		$sPreferredName = ' ';
		$sLastName = $aNameParts[1];
		if (substr($sLastName, 0, 1) == '"') {
			$sPreferredName = trim($sLastName, '"');
			$sLastName = ' ';
		}
	}
	else if (count($aNameParts)) {
		$sFirstName = $aNameParts[0];
		$sMiddleName = ' ';
		$sPreferredName = ' ';
		$sLastName = ' ';
		if (substr($sFirstName, 0, 1) == '"') {
			$sPreferredName = $sFirstName;
			$sFirstName = ' ';
		}
	}


	$aVars['first_name'] = $sFirstName;
	$aVars['middle_name'] = $sMiddleName;
	$aVars['preferred_name'] = isset($sPreferredName) ? $sPreferredName : ' ';
	$aVars['last_name'] = $sLastName;

	return $aVars;
}

/**
 * Calculate difference between two dates
 *
 * @author	Steve Keylon
 * @param	string $sStart
 * @param	string $sEnd
 * @return	array
 */
function calc_time_difference($sStart, $sEnd) {
	$aTimes['start'] = strtotime($sStart);
	$aTimes['end'] = strtotime($sEnd);
	if ($aTimes['start'] > 0 || $aTimes['end'] > 0) {
		$diff = $aTimes['end'] - $aTimes['start'];
		$weeks = intval(floor($diff / 604800));
		$diff = $diff % 604800;
		$days = intval(floor($diff / 86400));
		$diff = $diff % 86400;
		$hours = intval(floor($diff / 3600));
		$diff = $diff % 3600;
		$minutes = intval(floor($diff / 60));
		$diff = $diff % 60;
		$diff = intval($diff);
		return array('week' => $weeks, 'day' => $days, 'hour' => $hours, 'minute' => $minutes, 'second' => $diff);
	}
	else {
		trigger_error("Invalid Date entered. Start: $sStart, End: $sEnd", E_USER_WARNING);
	}
	return false;
}

/**
 * Change a time difference result to a string
 *
 * @author	Steve Keylon
 * @param	string $aTimeDifference a result from calc_time_difference
 * @param	string $sPrecision='second' Precision to stop at. Must match a key from calc_time_difference's returned array.
 * @return	string
 */
function time_difference_tostring($aTimeDifference, $sPrecision='second') {
	if (!is_array($aTimeDifference) || empty($aTimeDifference))
		return "";

	$sReturn = '';
	$sAgo = "";
	foreach ($aTimeDifference as $unit => $value) {
		if (empty($value))
			continue;
		if (empty($sAgo) && $value < 0)
			$sAgo = 'ago';
		$value = abs($value);

		$sReturn .= $value . " " . $unit . ($value == 1 ? " " : "s ") . " ";

		if ($sPrecision == $unit)
			break;
	}

	return $sReturn . $sAgo;
}

function get_user() {
	if ($nUserId = user_id()) {
		$oUserBase = new UserBase();
		$oUserBase->load($nUserId);

		return $oUserBase;
	}
	return FALSE;
}

function get_user_id() {
	if (isset($GLOBALS['oSession']) && $GLOBALS['oSession']->get('user_id') && is_numeric($GLOBALS['oSession']->get('user_id'))) {
		return $GLOBALS['oSession']->get('user_id');
	}
	return FALSE;
}

function get_username() {
	$oUser = get_user();
	pre($oUser);
	if (isset($oUser->user_name)) {
		return $oUser->user_name;
	}
	return FALSE;
}

function user_id() {
	return get_user_id();
}

function variable_name(&$var, $scope=false, $prefix='4@#$1^', $suffix='(^$9%@65') {
	if ($scope) {
		$vals = $scope;
	}
	else {
		$vals = $GLOBALS;
	}
	$old = $var;
	$var = $new = $prefix . rand() . $suffix;
	$vname = FALSE;
	foreach ($vals as $key => $val) {
		if ($val === $new)
			$vname = $key;
	}
	$var = $old;
	return $vname;
}

function prep_var($kVariable, $nMax = FALSE) {
	if (is_string($kVariable) || is_numeric($kVariable)) {
		$kVariable = trim($kVariable);
		$kVariable = is_numeric($nMax) ? substr($kVariable, 0, $nMax) : $kVariable;
	}
	return $kVariable;
}

function string($sVar, $vRequired = FALSE) {

	if ($vRequired && strlen($sVar) === 0)
		return FALSE;

	if (!$vRequired && $sVar !== FALSE && strlen($sVar) === 0)
		return TRUE;

	if (is_string($sVar) || is_numeric($sVar))
		return TRUE;

	return FALSE;
}

function number($nVar, $vRequired = FALSE) {
	if ($vRequired && strlen($nVar) === 0)
		return FALSE;

	if (is_numeric($nVar))
		return TRUE;

	return FALSE;
}

/**
 * List Equipment
 *
 * Will read the ContactManager database, and create a dropdown
 * box listing all Equipment
 *
 * @param String $sName Name for the select input (for form use)
 * @param String $sClass Assign the select tag a class
 * @param Mixed $sDefault Assign a value to be selected by default
 * @param Boolean $vMultiline Determines whether the select box is multiline
 *
 * @return String String containing HTML for a Select list with options.
 */
function list_equipment($sName='', $sClass='', $sDefault='', $vMultiline=false) {
	global $oDB;
	$res = $oDB->query('SELECT * FROM ContractManager.dbo.AvailableEquipment');

	$sHtml = "<select name='$sName' class='$sClass'" . ($vMultiline ? 'multiple="multiple" size="4"' : "") . ">";
	$sHtml .= ! $vMultiline ? "<option value=''> -- </option>" : "";
	while ($o = $oDB->db->fetch_object($res)) {
		$sHtml .= "<option value='$o->CarrEquipId'>$o->CarrEquipDesc</option>";
	}
	$sHtml .= "</select>";
	return $sHtml;
}

function get_equipm($nEquipId) {
	echo "DON'T USE THIS!!!!";
	return;
	global $oDB;
	$res = $oDB->query('SELECT CarrEquipDesc FROM ContractManager.dbo.AvailableEquipment
							WHERE CarrEquipId = "' . $oDB->db->escape($nEquipId) . '"');
	if ($o = $oDB->db->fetch_object($res)) {
		return $o->CarrEquipDesc;
	}
}

function get_zip($nLocId) {
	$oLocationBase = new LocationBase();
	$oLocationBase->where('location_id', '=', $nLocId);
	$aLocationBase = $oLocationBase->list();
	foreach ($aLocationBase->rows as $Location) {
		$a = $Location->zip;
		return $a;
	}
}

function get_zip_seq($nLocId) {
	$oLocationBase = new LocationBase();
	$oLocationBase->where('location_id', '=', $nLocId);
	$aLocationBase = $oLocationBase->list();
	foreach ($aLocationBase->rows as $Location) {
		$a = $Location->seq;
		return $a;
	}
}

/**
 * List Accessorials
 *
 * Will read the ContactManager database, and create a dropdown
 * box listing all Accessorials
 *
 * @param String $sName Name for the select input (for form use)
 * @param String $sClass Assign the select tag a class
 * @param String $sDefault Assign a value to be selected by default
 * 
 * @return String Returns a String containing HTML for a Select list with options.
 */
function list_accessorials($sName='', $sClass='', $sDefault='') {
	global $oDB;
	$res = $oDB->query('SELECT * FROM ContractManager.dbo.AccessorialCodes');

	$sHtml = "<select name='$sName' class='$sClass' style='width: 250px'>";
	$sHtml .= "<option value=''> -- </option>";
	while ($o = $oDB->db->fetch_object($res)) {
		$sHtml .= "<option value='$o->AccCodeID'>$o->AccCodeDesc</option>";
	}
	$sHtml .= "</select>";
	return $sHtml;
}

function get_accessorial_name($nId) {
	global $oDB;
	$res = $oDB->query('SELECT AccCodeDesc FROM ContractManager.dbo.AccessorialCodes
							WHERE AccCodeId = "' . $oDB->db->escape($nId) . '"');
	if ($o = $oDB->db->fetch_object($res)) {
		return $o->AccCodeDesc;
	}
}

/**
 * removes an array element by value
 * 
 * @param array $array the array to remove the element from
 * @param String $val the value to be removed from the array
 * @param bool $preserve_keys should the function preserve the keys of the stripped array
 */
function remove_item_by_value($array, $val = '', $preserve_keys = true) {
	if (empty($array) || !is_array($array))
		return false;
	if (!in_array($val, $array))
		return $array;

	foreach ($array as $key => $value) {
		if ($value == $val)
			unset($array[$key]);
	}
	return ($preserve_keys === true) ? $array : array_values($array);
}

/**
 * re-indexes an array by one of the elements of the array
 * ex. reindex by id
 * 		array(array('id'=> 25, 'value'=> 'some data'), 
 * 				array('id'=>52, 'value'=> 'some other data'))
 * 		will return array([25]=>array('id'=> 25, 'value'=> 'some data'), 
 * 							[52]=>array('id'=> 52, 'value'=> 'some other data')))
 * if the value to reindex by already exists, then index by index-$nNewIndex
 * 	this is technically an error, as the index chosen should be unique
 * @param $aA the array to reindex
 * @param $sIndexer the array element that is to be the array index
 * @return the newly indexed array
 */
function reindex_by_array_element($aA, $sIndexer) {
	$aNewArray = array();
	$nNewIndex = 1;
	foreach ($aA as $a) {
		// check if the array element has already been created
		if (array_key_exists($a[$sIndexer], $aNewArray)) {
			$aNewArray[$a[$sIndexer] . '-' . $nNewIndex] = $a;
			$nNewIndex++;
		}
		else
			$aNewArray[$a[$sIndexer]] = $a;
	}
	return $aNewArray;
}

/**
 * validate that a string is a valid url
 * @param sUrl - a string url
 * @return bool is the string a valide url
 */
function validateURL($sUrl) {
	$sV = "/^(http|https|ftp):\/\/([A-Z0-9][A-Z0-9_-]*(?:\.[A-Z0-9][A-Z0-9_-]*)+):?(\d+)?\/?/i";
	return (bool) preg_match($sV, $sUrl);
}

/**
 * format a sting into a readable phone number
 * the string must contain no whitespace, special chars '(',')','-','_','#','.'
 * the phone number part must be all numeric
 * the extension, if there is one, must be all numeric
 * @param $sPhoneNumber a string of characters with only alpha-numeric chars
 */
function format_phone_number($sPhoneNumber) {
	$sExtension = '';
	// separate the phone number from the extension
	if (preg_match('/([0-9]*)([a-zA-Z]*[0-9]*)?/', $sPhoneNumber, $aMatches)) {
		$sPhoneNumber = $aMatches[1];
		if (isset($aMatches[2]))
			$sExtension = $aMatches[2];
	}
	if (strlen($sPhoneNumber) == 11)
		$sValue = substr($sPhoneNumber, 0, 1) . ' - ' . '(' . substr($sPhoneNumber, 1, 3) . ') ' . substr($sPhoneNumber, 5, 3) . ' - ' . substr($sPhoneNumber, 8);
	elseif (strlen($sPhoneNumber) == 10) {
		$sValue = '(' . substr($sPhoneNumber, 0, 3) . ') ' . substr($sPhoneNumber, 3, 3) . ' - ' . substr($sPhoneNumber, 6);
	}
	elseif (strlen($sPhoneNumber) == 7)
		$sValue = substr($sPhoneNumber, 0, 3) . ' - ' . substr($sPhoneNumber, 4);
	else
		$sValue = $sPhoneNumber;
	if ($sExtension != "") {
		$sValue .= " $sExtension";
	}
	return $sValue;
}

/**
 * given a month in numeric format, return a 3-letter month
 * @param $nMonth
 * @return a 3-letter month(ex. Jan)
 */
function get_three_letter_month($nMonth) {
	if (empty($nMonth) || !is_numeric($nMonth) || $nMonth < 1 || $nMonth > 12)
		return false;
	switch (intval($nMonth)) {
		case 1: return 'Jan';
			break;
		case 2: return 'Feb';
			break;
		case 3: return 'Mar';
			break;
		case 4: return 'Apr';
			break;
		case 5: return 'May';
			break;
		case 6: return 'Jun';
			break;
		case 7: return 'Jul';
			break;
		case 8: return 'Aug';
			break;
		case 9: return 'Sep';
			break;
		case 10: return 'Oct';
			break;
		case 11: return 'Nov';
			break;
		case 12: return 'Dec';
			break;
	}
}

/*
  function lookup_zip($nLocId) {
  $oLocationBase = new LocationBase();
  $oLocationBase->where('location_id', '=', $nLocId);
  $aLocationBase = $oLocationBase->list();
  foreach( $aLocationBase->rows as $Location ) {
  $a = $Location->zip;
  return $a;
  }
  }
 */