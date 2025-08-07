<?php 
/**
 * Contact Owners
 *
 * @author Steve Keylon
 */
 
class ContactOwners extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_owners';
	
	public $fireEvents = true;

	public function create(	$nContactId, $nOwnerId, $nEffectiveDate, $nActive, $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nActive) ) {
			add_error('Active: ' . $nActive, $key);
			return false;
		}
		if ( !is_numeric($nOwnerId) ) {
			add_error('Owner Id: ' . $nOwnerId, $key);
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
		$this->set_contact_index( $this->get_NextIndex($nOwnerId) );
		$this->set_owner_id($nOwnerId);
		$this->set_effective_Date($nEffectiveDate);
		$this->set_active($nActive);
		$this->set_free_agent(0);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
	
	function get_NextIndex($nOwnerId) {
		$this->clear_filters();
		$this->where('owner_id', '=', $nOwnerId);
		$this->order('contact_index', 'desc');
		$a = $this->list()->rows;
		$o = new ContactOwners();
		if (isset($a[0]) ) {
			return $a[0]->get_Contact_Index() + 1;
		}else{
			// No contacts, so give it index #1
			return 1;
		}
	}
	
	function count_by_UserId ( $nUserId ) {
		// UserId = OwnerId
		$this->clear_filters();
		$this->where('owner_id', '=', $nUserId);
		$o = $this->list();
		return $o->returned_rows;
	}
	
	function list_contacts_by_user( $aUserId, $vObj = false) {
		// UserId = OwnerId
		//$this->clear_filters();
		//this->where('owner_id', '=', $nUserId);
		//$this->where('active', '=', 1);
		if ( !is_array($aUserId) ) $aUserId = array($aUserId);
		$aTmp = array();
		foreach ($aUserId as $id) {
			if (is_numeric($id)) $aTmp[] = $id;
		}
		$aUserId = $aTmp;
		$this->connect();
		$s = "SELECT owner.owner_id, customer.customer_name, (contact.first_name + ' ' + contact.last_name) as contact_name, contact.*, user_base.*, owner.* FROM tms.dbo.contact_owners owner
				LEFT JOIN tms.dbo.user_base ON user_base.user_id = owner.owner_id
				LEFT JOIN tms.dbo.contact_base AS contact ON contact.contact_id = owner.contact_id
				LEFT JOIN tms.dbo.location_to_contact loc ON loc.contact_id = contact.contact_id
				LEFT JOIN tms.dbo.customer_to_location toloc ON toloc.location_id = loc.location_id
				LEFT JOIN tms.dbo.customer_base customer ON toloc.customer_id = customer.customer_id
				WHERE owner.owner_id IN (" . implode(", ", $aUserId ) . ")
				AND contact.contact_type_id = '" . ContactTypes::Customer . "' OR contact.contact_type_id = '" . ContactTypes::BillTo . "'";
		$res = $this->query($s);
		$a = array();
		while( $row = $this->db->fetch_object($res) ) {
			if (!$vObj) {
				$a[] = (array)$row;
			} else
				$a[] = $row;
		}
//		echo "list contacts by user: ";
		return $a;
	}	
}
?>