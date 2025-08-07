<?php

class UserRoles extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'user_roles';

	const Admin = 1;
	const Billing = 2;
	const Broker = 3;
	const PodLoader = 4;
	const Auditing = 6;
	const CarrierPayables = 7;
	const CreditAndCollections = 8;
	const CustomerCompliance = 9;
	const CarrierCompliance = 10;
	const CashApplication = 11;
	const CarrierApproval = 12;

	public function create($aVars) {
		$sName = isset($aVars['role_name']) ? $aVars['role_name'] : '';
		$sLandingPage = isset($aVars['landing_page']) ? $aVars['landing_page'] : '';
		$nModeId = isset($aVars['mode_id']) ? $aVars['mode_id'] : '';
		$nCreatedById = isset($aVars['mode_id']) ? $aVars['mode_id'] : get_user_id();

		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if (!is_numeric($nModeId)) {
			add_error('MODE ID is invalid', $key);
			return false;
		}
		if (!is_string($sLandingPage)) {
			add_error('LANDING PAGE is invalid', $key);
			return false;
		}
		if (!is_string($sName)) {
			add_error('ROLE NAME is invalid', $key);
			return false;
		}
		if (!is_numeric($nCreatedById)) {
			add_error('CREATED BY ID is invalid', $key);
			return false;
		}

		// Save Data
		$this->set_role_name($sName);
		$this->set_landing_page($sLandingPage);
		$this->set_mode_id($nModeId);

		if (!$this->is_loaded()) {
			$this->set_created_by_id($nCreatedById);
		}
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->save();
		// Report
		return;
	}

	function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();

		$sHtml = '<select name="' . $sName . '" class="' . $sClass . '">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"" . $row->role_id . '"' . ( ($nDefault == $row->role_id) ? ' selected="selected"' : '' ) . '>' . $row->role_name . '</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}

}