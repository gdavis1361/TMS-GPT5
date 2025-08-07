<?php
class Edi_Tender {
	
	public $xmlObject = array();
	
	public function __construct($xmlObject) {
		if(is_string($xmlObject)){
			$xmlObject = simplexml_load_string($xmlObject);
		}
		$this->xmlObject = $xmlObject;
	}
	
	public function getStops(){
		return $this->convertToArray($this->xmlObject->Stops->Stop);
	}
	
	/**
	 * Converts a fake xml array into a real array
	 * 
	 * @param array $array
	 * @return array $items
	 */
	private function convertToArray($array){
		$items = array();
		foreach ($array as $item){
			$items[] = $item;
		}
		return $items;
	}
	
	/**
	 * Builds the xml stops into a format that the system can understand
	 */
	private function buildStops(){
		$stops = $this->getStops();
		foreach ($stops as $stop){
			$this->getLocation($stop);
		}
	}
	
	/**
	 * Attempts to find a location associated with a stop,
	 * if the location is not found it is created
	 * 
	 * @param array $stop 
	 */
	private function getLocation($stop){
		$stopLocation = $stop['Location'];
		$locationBase = new LocationBase();
		$searchArray = array(
			'address_1' => trim($stopLocation['Address1']),
			'zip' => trim($stopLocation['Zip'])
		);
		if(is_string($stopLocation['Address2']) && strlen($stopLocation['Address2'])){
			$searchArray['address_2'] = trim($stopLocation['Address2']);
		}
		
		$locationBase->load($searchArray);
		if(!$locationBase->get('location_id')){
			//Create the location
			pre('creating locaiton...');
		}
		pre($locationBase->get());
		
		return $locationBase;
	}
	
	public function convertToPreOrder(){
		
		/////////////////////////////////////////////////////
		//	Customer Information
		/////////////////////////////////////////////////////
		
		/*
		$customerId = intval(getPostParam('customer_id', 0));
		$orderedById = getPostParam('ordered_by_id', 0);
		$myUserId = get_user_id();
		$sExpiration = request('expiration_date', strtotime('+60 days'));
		$billToId = intval(getPostParam('bill_to_id', 0));
		if (!$billToId) {
			$billToId = $customerId;
		}
		*/
		
		/////////////////////////////////////////////////////
		//	Create the PreOrder
		/////////////////////////////////////////////////////
		$preOrder = new PreOrderBase();
		/*
		$preorder->create(
			$customerId,
			$orderedById,
			$myUserId,
			$myUserId,
			true,
			false,
			false,
			$sExpiration
		);
		*/
		
		/////////////////////////////////////////////////////
		//	Bill To
		/////////////////////////////////////////////////////
		/*
		if($billToId){
			$preOrderToBillTo = new PreOrderToBillTo();
			$preOrderToBillTo->load(array(
				'pre_order_id' => $preorder->get('pre_order_id')
			));
			$preOrderToBillTo->create($preorder->get('pre_order_id'), $billToId);
		}
		*/
		
		
		/////////////////////////////////////////////////////
		//	Order Details
		/////////////////////////////////////////////////////
		/*
		if($aOrderDetails){
			$preorder->update_details($aOrderDetails);
		}
		*/

		/////////////////////////////////////////////////////
		//	Stops
		/////////////////////////////////////////////////////
		$this->buildStops();
		/*
		if($aStops){
			$preorder->update_stops($aStops);
		}
		*/
		
		/////////////////////////////////////////////////////
		//	Charges
		/////////////////////////////////////////////////////
		/*
		if($charges){
			$preorder->updateCharges($charges);
		}
		*/
	}
}
