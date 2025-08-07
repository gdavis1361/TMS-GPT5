<?php 
/**
 * Contact Customer Detail
 *
 * @author Steve Keylon
 */
 
class ContactCustomerDetail extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_customer_detail';
	
	const Cold = 9;
	const Warm = 10;
	const Hot = 11;

	public $fireEvents = true;
	public $checkTasks = true;
	
	public function create(	$nContactId, $nStatusId, $nPotentialId, $nCallInterval, $nEmailInterval, 
							$nVisitInterval, $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if (!is_numeric($nVisitInterval) ) {
			add_error('Visit Inerval: ' . $nVisitInterval, $key);
			return false;
		}
		if (!is_numeric($nEmailInterval) ) {
			add_error('Email Interval: ' . $nEmailInterval, $key);
			return false;
		}
		if (!is_numeric($nCallInterval) ) {
			add_error('Call Interval: ' . $nCallInterval, $key);
			return false;
		}
		if ( !is_numeric($nPotentialId) ) {
			add_error('Potential Id: ' . $nPotentialId, $key);
			return false;
		}
		if (!is_numeric($nStatusId) ) {
			add_error('Status Id: ' . $nStatusId, $key);
			return false;
		}
		if ( !is_numeric($nContactId) ) {
			add_error('Contact Id: ' . $nContactId, $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return false;
		}
		
		
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_status_id($nStatusId);
		$this->set_potential_id($nPotentialId);
		$this->set_call_interval($nCallInterval);
		$this->set_email_interval($nEmailInterval);
		$this->set_visit_interval($nVisitInterval);
				
		$this->set_next_call( $nCallInterval ? strtotime("+" . $nCallInterval . " days") : false);
		$this->set_next_email( $nEmailInterval ? strtotime("+" . $nEmailInterval . " days") : false);
		$this->set_next_visit( $nVisitInterval ? strtotime('+' . $nVisitInterval . ' days') : false);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		return $this->save();
		
	}
	
	public function up_to_date_by_user( $nUserId ) {
		$oOwner = new ContactOwners();
		$aContacts = $oOwner->list_contacts_by_user( $nUserId );
		if ( count($aContacts) === 0 ) { 
			//error 
			return array();
		}
		
		$this->clear_filters();
		$this->where('contact_id', '=', $aContacts);
		add_note('is this it?');
		$this->where(array('next_email','next_call','next_visit'), '>=', date('Y-m-d') . ' 00:00:00' );
		return $this->list();
	}
	
	public function get_average_intervals( $nUserId ){
		global $oDB;
		
		$s = "SELECT 
				AVG(cast(call_interval as decimal(5,2))) as call_interval_avg
			FROM contact_customer_detail 
			WHERE 
				call_interval > '0' AND call_interval < 50 AND 
				contact_id IN ( SELECT contact_id FROM contact_owners WHERE owner_id = '". $nUserId ."') ";
		
		$res = $oDB->query($s);
		$o = $oDB->db->fetch_object($res);
		
		return round($o->call_interval_avg, 2);
	}
	
	public function get_details_by_contact_id( $nContactId ){
		$this->clear();
		$a = array();
		if ( $this->load($nContactId) ) {
			$a['nPotentialId']   = $this->get('potential_id');
			$a['nStatusId']      = $this->get('status_id');
			
			$a['nCallInterval']  = $this->get('call_interval');
			$a['nNextCall']      = ( strlen($this->get('next_call')) > 0 ) ? mktime( 0, 0, 0, date('m',strtotime($this->get('next_call'))), date('d',strtotime($this->get('next_call'))), date('Y',strtotime($this->get('next_call'))) ) : 0 ;
			$a['vNextCallDue']   = ( $a['nNextCall'] && ( ( $a['nNextCall'] - time() ) <= 0 ) ) ? TRUE : FALSE ;
			
			$a['nEmailInterval'] = $this->get('email_interval');
			$a['nNextEmail']     = ( strlen($this->get('next_email')) > 0 ) ? mktime( 0, 0, 0, date('m',strtotime($this->get('next_email'))), date('d',strtotime($this->get('next_email'))), date('Y',strtotime($this->get('next_email'))) ) : 0 ;
			$a['vNextEmailDue']  = ( $a['nNextEmail'] && ( ( $a['nNextEmail'] - time() ) <= 0 ) ) ? TRUE : FALSE ;
			
			$a['nVisitInterval'] = $this->get('visit_interval');
			$a['nNextVisit']     = ( strlen($this->get('next_visit')) > 0 ) ? mktime( 0, 0, 0, date('m',strtotime($this->get('next_visit'))), date('d',strtotime($this->get('next_visit'))), date('Y',strtotime($this->get('next_visit'))) ) : 0 ;
			$a['vNextVisitDue']  = ( $a['nNextVisit'] && ( ( $a['nNextVisit'] - time() ) <= 0 ) ) ? TRUE : FALSE ;
		}else{
			$a['error'] = "Error loading contact id $nContactId.";
		}
		return $a;
	}
	
	public function save() {
		$this->set_next_contact_dates();
		
		parent::save();
		
		if ($this->checkTasks) {
			$contact = new ContactBase();
			$contact->load($this->get('contact_id'));
			$contact->checkTasks();
		}
	}
	
	private function set_next_contact_dates(){
		if ( !strtotime( $this->get('next_call') ) ){
			$nInterval = (int)$this->get('call_interval');
			$sDistance = (!is_numeric($nInterval) || empty($nInterval)) ? "" : ($nInterval . " days");
			$sNextCall = empty($sDistance) ? NULL : strtotime("+" . $sDistance);
			$this->set('next_call', $sNextCall);
		}
		
		if ( !strtotime($this->get('next_email') ) ){
			$nInterval = (int)$this->get('email_interval');
			$sDistance = (!is_numeric($nInterval) || empty($nInterval)) ? "" : ($nInterval . " days");
			$sNextEmail = empty($sDistance) ? NULL : strtotime("+" . $sDistance);
			$this->set('next_email', $sNextEmail);
		}
		
		if ( !strtotime($this->get('next_visit')) ){
			$nInterval = (int)$this->get('visit_interval');
			$sDistance = (!is_numeric($nInterval) || empty($nInterval)) ? "" : ($nInterval . " days");
			$sNextVisit = empty($sDistance) ? NULL : strtotime("+" . $sDistance);
			$this->set('next_visit', $sNextVisit);
		}
		
		$this->setNextAction();
	}
	
	public function setNextAction(){
		$actions = array(
			'call' => strtotime($this->get('next_call')),
			'email' => strtotime($this->get('next_email')),
			'visit' => strtotime($this->get('next_visit'))
		);
		asort($actions);
		
		$nextActionName = false;
		$nextActionDate = false;
		foreach ($actions as $key => $value) {
			if ($key != 'visit') {
				if ($value !== false) {
					$nextActionName = $key;
					$nextActionDate = $value;
					break;
				}
			}
		}
		
		$this->set('next_action_name', $nextActionName);
		$this->set('next_action_date', $nextActionDate);
	}
	
	public function markUpToDate($sType){
		if (!$this->is_loaded()) return;
		$sType = trim( strtolower($sType) );
		
		switch($sType){
			case "call":
				$nInterval = (int)$this->get('call_interval');
			break;
			case "email":
				$nInterval = (int)$this->get('email_interval');
			break;
			case "visit":
				$nInterval = (int)$this->get('visit_interval');
			break;
			default: return; break;
		}
		$sDistance = intval($nInterval) . " days";
		$sNext = date('Y-m-d', strtotime("+" . $sDistance));
		$this->set('next_'.$sType, $sNext);
		$this->setNextAction();
		$this->save();
		
	}
	
}