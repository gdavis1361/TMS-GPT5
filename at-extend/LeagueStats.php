<?php 

/**
 * League Stats
 *
 * @author Steve Keylon
 */

 
/*
 *  Triggers
 * When these events occur, multiple tables on the DB will be modified. 
 * 
 * [ ] Call Completed
 * [ ] Quote Entered
 * [ ] RFP Entered
 * [ ] Visit entered
 */

class LeagueStats extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_stats';
	public $fireEvents = true;

	public function create($nUserId, $nDateId = null) {
		if ( empty($nUserId) ) $nUserId = get_user_id();
		
		if ( !is_numeric($nUserId) ) {
			add_error('User Id: ' . $nUserId, $key);
			return false;
		}
		
		$oDates = new LeagueDates();
		if(!intval($nDateId) || $nDateId == null){
			$nDateId = $oDates->get_date();
		}
		
		//$nDateId = 3;
		$oEmp2Team = new UserEmployeeToTeam();
		$nTeamId = $oEmp2Team->get_user_team($nUserId);
		
		$oEmp2Branch = new UserEmployeeToBranch();
		$nBranchId = $oEmp2Branch->get_user_branch($nUserId);
		
		$this->set_user_id($nUserId);
		$this->set_date_id( $nDateId );
		$this->set('league_team_id', $nTeamId);
		$this->set('branch_id', $nBranchId);
		
		return $this->retotal();
	}
	
	private function retotal() {
		$nUserId = $this->get_user_id();
		//if ( !$this->is_loaded() ) return;
		
		$this->set_values('revenue', $this->calc_total_revenue() );
		$this->set_values('cost', $this->calc_total_cost() );
		$this->calc_total_margin();

		// load total contacts
		$this->set_values('total_contacts', $this->calc_total_contacts() );
		
		// load total contacts up to date
		$nUpToDate = $this->calc_up_to_date_contacts();
		$this->set_values('up_to_date_contacts', $nUpToDate );
		
		// total contacts up to date %
		$pct = $this->calc_up_to_date_pct();
		$this->set_values('up_to_date_pct', $pct );
		
		// Call interval avg
		$avg = $this->calc_avg_interval();
		$this->set_values('call_interval_avg', $avg ) ;
		
		$aPtsFields = array('margin_pts', 'margin_pct_pts', 'total_contacts_pts', 'call_interval_pts', 'call_up_to_date_pct_pts', 'email_up_to_date_pct_pts', 'visit_up_to_date_pct_pts', 'ob_calls_new_cust_pts', 'ob_calls_cust_pts', 'ob_calls_new_carrier_pts', 'ob_calls_carrier_pts', 'ob_calls_total_pts', 'ob_talk_time_new_cust_pts', 'ob_talk_time_cust_pts', 'ob_talk_time_new_carrier_pts', 'ob_talk_time_carrier_pts', 'ob_talk_time_total_pts', 'emails_new_cust_pts', 'emails_cust_pts', 'emails_new_carrier_pts', 'emails_carrier_pts', 'emails_total_pts', 'email_blasts_pts', 'quick_quotes_pts', 'rfp_quotes_pts', 'quick_quote_conversion_pts', 'rfp_quote_conversion_pts', 'total_visits_pts', 'visits_new_cust_pts', 'visits_cust_pts', 'visits_new_carriers_pts', 'visits_carriers_pts', 'first_time_shipments_pts', 'loads_pts', 'new_contacts_pts' );
		
		$nTotal = 0;
		foreach($aPtsFields as $field) {
			$nTotal += (float)$this->get($field);
		}
		$this->set('points', $nTotal);
		$this->set('total_contacts_pts', 0);
		
		return $this->save();
	
	}
	
	public function calc_total_margin(){
	
		$ChargeQueryNeeded = true;
			
		$o = new DBModel();
		$o->connect();
		$s = "SELECT ob.broker_id, oc.total_charge, oc.total_cost, oc.total_profit FROM tms.dbo.order_base ob
				LEFT JOIN tms.dbo.order_charge oc ON ob.order_id = oc.order_id
				WHERE ob.broker_id = ".$this->get_user_id();

		$res = $o->query($s);
		
		$myTotalRevenue = 0;
		$myTotalCost = 0;
		$myTotalMargin = 0;

		while ( $data = $o->db->fetch_array($res) ) { 
			$myTotalRevenue += $data['total_charge'];
			$myTotalCost += $data['total_cost'];
			$myTotalMargin += $data['total_profit'];
		}
		
		$myTotalMarginPct = 1.0000;
		if(intval($myTotalRevenue)){
			$myTotalMarginPct = $myTotalMargin / $myTotalRevenue ;
		}
		
		$this->set_values('revenue', $myTotalRevenue);
		$this->set_values('cost', $myTotalCost);
		$this->set_values('margin', $myTotalMargin);
		$this->set_values('margin_pct', $myTotalMarginPct);
		
	}

	private function calc_total_contacts() {
		$nUserId = $this->get_user_id();
		//if ( !$this->is_loaded() ) return;
		$s = "SELECT COUNT(detail.contact_id) as total FROM contact_customer_detail detail
				JOIN contact_owners owner ON owner.contact_id = detail.contact_id
				WHERE detail.call_interval BETWEEN 1 AND 50
				 AND owner.owner_id = '" . $nUserId ."'";
		$res = $this->query($s);
		$o = $this->db->fetch_object($res);
		return (int)$o->total;
	}
	
	public function calc_up_to_date_pct() {
		$nUserId = $this->get('user_id');
		//if ( !$this->is_loaded() ) return;
		$nUpToDate = $this->get_up_to_date_contacts();
//		error_log( "Up To Date: $nUpToDate" );
		$nContactCount = $this->get_total_contacts();
//		error_log( "Total: $nContactCount");
		return @(float)($nContactCount != 0 ? round($nUpToDate / $nContactCount, 4) : 0);
	}
	
	private function calc_avg_interval($nUserId=null) {
		if ($nUserId == null) $nUserId = $this->get_user_id();
		//if ( !$this->is_loaded() ) return;
		$oCustomerDetail = new ContactCustomerDetail();
		return (float)$oCustomerDetail->get_average_intervals( $nUserId );
	}
	
	private function calc_up_to_date_contacts() {
		$nUserId = $this->get_user_id();
		//if ( !$this->is_loaded() ) return;
		$s = "SELECT COUNT(detail.contact_id) as total FROM contact_customer_detail detail
				JOIN contact_owners owner ON owner.contact_id = detail.contact_id
				WHERE detail.call_interval BETWEEN 1 AND 50
				 AND owner.owner_id = '" . $nUserId ."'
				 AND next_call >= GETDATE()
				 AND next_visit >= GETDATE()
				 AND next_email >= GETDATE()";
		$res = $this->query($s);
		$o = $this->db->fetch_object($res);
		return (int)$o->total;
	}
	
	function load_by_user($nUserId, $nDateId = null) {
		$oLeagueDate = new LeagueDates();
		if ( empty($nDateId) ) $nDateId = $oLeagueDate->get_date();
		if ( is_string($nDateId) ) $nDateId = $oLeagueDate->get_date($nDateId);

		if ( empty($nDateId) ) return; // This will happen if dateId was a string and didn't parse properly.
		
		$a = array('date_id' => $nDateId, 'user_id' => $nUserId);
		if ( $this->load($a) ) {
			 
			return true;
		} else {
			return $this->create($nUserId, $nDateId);
		}
	}
	
	public static function update_order_cost($sName, $oRow){
		$o = new LeagueStats();
		$s = "SELECT broker_id FROM order_base WHERE order_id = '" . $oRow->get('order_id') . "'";
		$res = $o->db->query($s);
		$row = $o->db->fetch_object($res);
		$nUserId = $row->broker_id;
		$o->load_by_user($nUserId);
		
		$o->calc_total_margin();
		return $o->save();
	}
	
	public static function add_contact($sName, $oRow){
		$nUserId = $oRow->get('owner_id');
		
		$o = new LeagueStats();
		$o->load_by_user($nUserId);
		
		$a = array('total_contacts' => 1, 'new_contacts' => 1);
		$o->increment_values($a);
		return $o->save();
	}
	
	public static function update_contact_details($sName, $oRow) {
		global $oDB;
		$s = "SELECT TOP 1 owner_id 
				FROM contact_owners 
				WHERE contact_id = '" . $oRow->get('contact_id') . "'
					AND effective_date <= GETDATE()";
		$res = $oDB->query($s);
		$ob = $oDB->db->fetch_object($res);
		$nUserId = $ob->owner_id;
		$aModified = $oRow->m_aModifiedValues['contact_customer_detail'];
		
		$o = new LeagueStats();
		$o->load_by_user($nUserId);
		if (isset($aModified['call_interval'])){
			$o->set_values('call_interval_avg', $o->calc_avg_interval($nUserId) );
		}
		
		if ( isset($aModified['next_call']) || isset($aModified['next_visit']) || isset($aModified['next_email'])){
			// TODO: contacts up to date. 
			$o->set_values('up_to_date_contacts', $o->calc_up_to_date_contacts());
			$o->set_values('up_to_date_pct', $o->calc_up_to_date_pct());
		}
		
		$o->save();
	}
	
	/*
	 * Increment Values. This function will increment any column and manage points associated. 
	 * 
	 * @param $aColumns Mixed This can be an associative array with key names of columns, and values of increment values, or you can increment one column by passing the column name and value as separate parameters.
	 * @param $nValue float Only used if a string is provided as the first parameter. 
	 * 
	 */
	public function increment_values($aColumns, $nValue=null){
		if (!$this->is_loaded()) return false; //MUST BE LOADED
		if (!$this->is_connected()) $this->connect();
		
		if (is_string($aColumns)){
			if ($nValue === null) $nValue = 1;
			$aColumns = array($aColumns => $nValue);
		}
		if (!is_array($aColumns)) return false;
		
		$aPointValues = LeagueStats::get_point_values();
		$aPointRows = $this->db->table_columns('league_stats');
		
		$nPoints = $this->get('points');
		
		foreach($aColumns as $column => $value){
			
			if (!is_string($column)) continue;
			
			// Get, Increment, set. 
			$nOldValue = $this->get($column);
			$nNewValue = $nOldValue + $value;
			$this->set($column, $nNewValue);
			
			$pts = $column . "_pts";
			if (in_array($pts, $aPointRows)){
				$nPointValue = $aPointValues[$column];

				$nOldPts = $this->get($pts);

				$nNewPts = $nOldPts + ($nPointValue * $value);

				$nPoints += ($nPointValue * $value);

				$this->set($pts, $nNewPts);
			}
			
		}
		$this->set('points', $nPoints);
	}
	
	public function set_values($aColumns, $sValue=null){
		//if (!$this->is_loaded()) return false; //MUST BE LOADED
		if (!$this->is_connected()) $this->connect();
		
		if (is_string($aColumns)){
			if ($sValue === null) $sValue = 1;
			$aColumns = array($aColumns => $sValue);
		}
		if (!is_array($aColumns)) return false;
		
		$aPointValues = LeagueStats::get_point_values();
		$aPointRows = $this->db->table_columns('league_stats');
		
		$nPoints = $this->get('points');
		
		foreach($aColumns as $column => $value){
			if (!is_string($column)) continue;
			
			$this->set($column, $value); //set new column value
			
			$pts = $column . "_pts";
			if (in_array($pts, $aPointRows)){
				$nPointValue = $aPointValues[$column];

				$pts = $column . "_pts";
				$nColPts = $this->get($pts);
				$nPoints -= $nColPts; // subtract points that were associated with this column
				$this->set($pts, ($nPointValue * $value));  // set new point value
				$nPoints += ($nPointValue * $value); // update total with new point value
			}
		}
		$this->set('points', $nPoints);
	}
	
	public static function get_point_values(){
		global $oDB;
		$s = "SELECT type.slug, (
				SELECT TOP 1 point_value 
				FROM league_point_values 
				WHERE point_type_id = type.point_type_id 
					AND effective_date <= GETDATE() 
				ORDER BY effective_date DESC) as val
			FROM league_point_types type";
		
		$res = $oDB->query($s);
		$a = array();
		while ($row = $oDB->db->fetch_object($res)){
			$a[$row->slug] = $row->val;
		}
		return $a;
	}
	
	/**
	 * Generate a stat entry for every user
	 * @param type $event 
	 */
	public static function generateStats($event){
		//Get the date
		$date = date('Y-m-d 00:00:00');
		if(isset ($_REQUEST['date'])){
			$date = date('Y-m-d 00:00:00', strtotime($_REQUEST['date']));
		}
		$leagueDate = new LeagueDates();
		$leagueDate = new LeagueDates($leagueDate->get_date($date));

		//Get all users
		$query = "SELECT * FROM user_base";
		$rows = LP_Db::fetchAll($query);
		foreach ($rows as $row){
			$stats = new LeagueStats();
			$stats->load_by_user($row['user_id'], $leagueDate->get('date_id'));
			$stats->save();
		}
	}
}
?>