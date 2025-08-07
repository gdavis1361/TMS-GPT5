<?php

class Location_ProcessController extends AjaxController {
	
	public function getLocationDataAction() {
		$locationId = intval(getParam('location_id', 0));
		$query = "SELECT * FROM location_base WHERE location_id = $locationId";
		$row = LP_Db::fetchRow($query);
		if (!$row) {
			$this->addError('Invalid location');
		}
		$this->setParam('record', $row);
	}
	
	public function processAction() {
		$locationId = intval(getParam('location_id', 0));
		$customerId = intval(getParam('customer_id', 0));
		$carrierId = intval(getParam('carrier_id', 0));
		
		$sName1 = request('name1', '');
		$sName2 = request('name2', '');
		$sAddress1 = request('address1', '');
		$sAddress2 = request('address2', '');
		$sAddress3 = request('address3', '');
		$sCity = request('city', '');
		$sState = request('state', '');
		$sZip = request('zip', '');
		$sSeq = request('seq', 1);
		
		$vJobSite = request('job_site', false);
		$locationTypeId = intval(getParam('locationTypeId', 0));
		
		if (LocationBase::checkName($sName1) && !strlen($sName2)) {
			$this->addError('Second Location Name is required', 'name2');
			return;
		}

		// Create or update the location
		$locationBase = new LocationBase($locationId);
		$locationBase->create($sName1, $sName2, $sAddress1, $sAddress2, $sAddress3, $sZip, $sSeq, get_user_id(), $locationTypeId);
		
		if ($locationBase->anyErrors()) {
			// Copy the object's errors to the ajax controller's errors
			foreach ($locationBase->getErrors() as $key => $error) {
				if (intval($key)) {
					$this->addError($error);
				}
				else {
					$this->addError($error, $key);
				}
			}
		}
		else {
			// Check if the location is a job site and set it
			if ($vJobSite) {
				$locationBase->set('job_site', 1);
				$locationBase->save();
			}
			
			// Associate location with customer or carrier
			$locationId = $locationBase->get('location_id');
			if ($customerId) {
				$customerBase = new CustomerBase($customerId);
				$customerBase->add_location($locationId);
				$customerBase->checkTasks();
			}
			else if ($carrierId) {
				$carrierBaseExtended = new CarrierBaseExtended($carrierId);
				$carrierBaseExtended->addLocation($locationId);
				$carrierBaseExtended->checkTasks();
			}
		}
		$this->setParam('record', $locationBase->get());
		$this->addMessage('Location has been saved.');
	}

	public function checkNameAction() {
		$sName = request('name', '');
		$o = LocationBase::checkName($sName);
		$this->setParam('record', array('exists' => $o ? true : false));
	}

	public function lookupCustomerAction() {
		$customerBase = new CustomerBase(intval(getParam('customerId', 0)));
		$record = $customerBase->getBillToRecord();
		if ($record) {
			$this->setParam('record', $record);
		}
		else {
			$this->addError('No record found');
		}
	}

	public function lookupContactAction() {
		$contactBase = new ContactBase(intval(getParam('contactId', 0)));
		$record = $contactBase->getBillToRecord();
		if ($record) {
			$this->setParam('record', $record);
		}
		else {
			$this->addError('No record found');
		}
	}

	public function getLocationTypesAction() {
		$query = "SELECT * FROM location_types ORDER BY name";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}

}