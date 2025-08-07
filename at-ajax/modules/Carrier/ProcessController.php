<?php
class Carrier_ProcessController extends AjaxController {
	
	public function processAction(){
		$sName1 = LP_Db::escape(request('name1', ''));
		$nMcNumber = LP_Db::escape(request('mc_no', '000000'));
		$aPaymentType = LP_Db::escape(request('payment_type', array()));
		$sSafetyRating = LP_Db::escape(request('safety_rating', ''));
		$sSafetyRatingDate = LP_Db::escape(request('safety_date', 'C'));
		$nCommonAuthority = LP_Db::escape(request('common_auth', 'N'));
		$sContractAuthority = LP_Db::escape(request('contract_auth', 'N'));
		$sBrokerAuthority = LP_Db::escape(request('broker_auth', 'N'));
		$locationId = intval(request("location_id", 0));
		
		$aInsuranceInfo = json_decode( request('insurance_info', array()) );

		$carrierBase = new CarrierBase();
		$carrierBaseExtended = new CarrierBaseExtended();
		$extended = $carrierBase->create(
			$sName1,
			$nMcNumber,
			$sSafetyRating,
			$sSafetyRatingDate,
			$nCommonAuthority,
			$sContractAuthority,
			$sBrokerAuthority,
			get_user_id()
		);
		
		//Check for any errors that occured while adding to carrier base
		if($carrierBase->anyErrors()){
			foreach ($carrierBase->getErrors() as $error){
				$this->addError($error);
			}
		}
		
		//Check for any errors that occured while adding to carrier extended
		if(!$this->anyErrors() && $carrierBase->anyErrors()){
			foreach ($extended->getErrors() as $error){
				$this->addError($error);
			}
		}
		
		if(!$this->anyErrors()){
			$nCarrierId = $carrierBase->get('carrier_id');
			
			$carrierBaseExtended->load(array(
				"carrier_id" => $nCarrierId
			));

			//Create a location if locationId was sent
			if($locationId){
				$relateLocation = new LocationToCarriers();
				$relateLocation->load(array(
					"carrier_id" => $nCarrierId,
					"location_id" => $locationId,
				));
				if(!$relateLocation->get('carrier_id')){
					$relateLocation->create($locationId, $nCarrierId, get_user_id());
				}
			}
			
			//Save Insurance Info
			foreach($aInsuranceInfo as $insurance){
				
//				$aRequiredKeys = array(
//			˚	'carrier_id', 
//			˚	'insurance_type_id', 
//			˚	'policy_number', 
//			˚	'effective_date', 
//			˚	'agency_id');
//				$aOptionalKeys = array('insurance_value', 'insurance_provider_id');
		
				$aAgency = InsuranceAgencies::find($insurance->agency_name);
				$aType = InsuranceTypes::find($insurance->insurance_type_name);
				
				$o['insurance_type_id'] = $aType['insurance_type_id'];
				$o['insurance_agency_id'] = $aAgency['insurance_agency_id'];
				$o['policy_number'] = $insurance->policy_number;
				$o['effective_date'] = strtotime($insurance->effective_date);
				$o['insurance_value'] = isset($insurance->insurance_value) ? intval($insurance->insurance_value) : null;
				$o['carrier_id'] = intval($nCarrierId);
				
				
				$oCarrierInsurance = new CarrierInsurance();
				$oCarrierInsurance->create($o);
			}
		}
		
		$this->setParam("record", $carrierBaseExtended->get());
	}
	
	public function addLocationAction(){
		$locationId = intval(request("location_id", 0));
		$carrierId = intval(request('carrier_id', 0));
		
		//Create a location if locationId was sent
		if($locationId && $carrierId){
			$relateLocation = new LocationToCarriers();
			$relateLocation->create($locationId, $carrierId, get_user_id());
		}
	}
	
	public function saveLocationAction(){
		$carrierId = intval(request('carrier_id', 0));
		$locationId = intval(request('location_id', 0));
		$query = "DELETE FROM location_to_Carriers WHERE carrier_id = $carrierId";
	}
	
	public function getContactsAction() {
		$carrierId = intval(request('carrier_id', 0));
		$carrierBaseExtended = new CarrierBaseExtended();
		$carrierBaseExtended->load($carrierId);
		$rows = $carrierBaseExtended->getContacts();
		$this->setParam('records', $rows);
	}
	
	public function getPayToDataAction() {
		$carrierId = intval(request('carrier_id', 0));
		$carrierBaseExtended = new CarrierBaseExtended($carrierId);
		
		$forCarrierName = $carrierBaseExtended->getCarrierName();
		$data = array(
			'customer_id' => 0,
			'customer_name' => '',
			'location_id' => 0,
			'location_name' => '',
			'forCarrierName' => $forCarrierName
		);
		
//		$payToRecord = $carrierBaseExtended->getPayToRecord();
		
		$query = "SELECT pay_to_location_id FROM carrier_to_pay_to WHERE carrier_id = $carrierId";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$data['location_id'] = $row['pay_to_location_id'];
			if ($data['location_id']) {
				// look up location and customer
				$query = "SELECT customer_base.customer_id, customer_base.customer_name, location_base.location_name_1
					FROM location_base, customer_to_location, customer_base
					WHERE location_base.location_id = {$data['location_id']}
					AND location_base.location_id = customer_to_location.location_id
					AND customer_to_location.customer_id = customer_base.customer_id";
				$row = LP_Db::fetchRow($query);
				if ($row) {
					$row['location_name'] = $row['location_name_1'];
					$data = array_merge($data, $row);
				}
			}
		}
		$this->setParam('data', $data);
	}
	
	public function savePayToAction() {
		$carrierId = intval(request('carrier_id', 0));
		$payToLocationId = intval(request('pay_to_location_id', 0));
		$myId = get_user_id();
		
		// check if there is a row so we can update it
		$carrierToPayTo = new CarrierToPayTo();
		$carrierToPayTo->load(array(
			'carrier_id' => $carrierId
		));
		if ($carrierToPayTo->get('carrier_id')) {
			$carrierToPayTo->set('pay_to_location_id', $payToLocationId);
			$carrierToPayTo->save();
		}
		else {
			$carrierToPayTo->create($carrierId, 0, $myId, $payToLocationId);
		}
		
		// check carrier tasks for pay to
		$carrierBaseExtended = new CarrierBaseExtended($carrierId);
		$carrierBaseExtended->checkTasks();
	}
	
	public function getOrderInfoAction() {
		$nOrderId = intval(request('order_id', 0));
		$oOrder = new OrderBase();
		$oOrder->load($nOrderId);
		$rows = $oOrder->getCarrierInfo();
		$equip = $oOrder->list_equipment();
		$this->setParam('carrier_id', $rows['CarrID']);
		$this->setParam('carrier_name', $rows['CarrName']);
		$this->setParam('contact_name', $rows['contact_name']);
		$this->setParam('contact_id', $rows['contact_id']);
		$this->setParam('equipment_id', $rows['equipment_id']);
		$this->setParam('equipment_list', $equip);
	}
	
	public function getLocationsAction() {
		$carrierId = intval(getParam('carrier_id', 0));
		$rows = array();
		
		$query = "SELECT location_base.*
			FROM location_base, location_to_carriers
			WHERE location_base.location_id = location_to_carriers.location_id
			AND location_to_carriers.carrier_id = $carrierId";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}
}