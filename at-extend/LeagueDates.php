<?php 

/**
 * League Dates
 *
 * @author Steve Keylon
 */

class LeagueDates extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_dates';

	public function create( $nCreatedById, $sDate = "" ) {
		// This will create a new record with no information except date (today's by default) and
		// an associated user.
		
		// Sets it as today's date if not entered. 
		if ( empty($sDate) ) $sDate = date(DATE_RSS);
		
		//Ensure a zero hour, minute, second for the date
		$sDate = date('Y-m-d 00:00:00', strtotime($sDate));
		
		// Check if the date already exists to prevent duplicates. 
		$this->where( 'league_date', '=', $sDate );
		$a = $this->list()->rows;
		if (isset($a[0])) { return; }
		
		$aDate = $this->parse_date($sDate);
		
		$this->set_league_date($sDate);
		$this->set_league_week($aDate['week']);
		$this->set_league_quarter($aDate['quarter']);
		$this->set_league_season($aDate['quarter']); // Quarter and Season are the same for now.
		$this->set_league_year($aDate['year']);
		$this->set_league_month($aDate['month']);
		$this->set_league_day_month($aDate['day']);
		$this->set_league_day_week($aDate['wday']);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		return $this->save();
	}
	
	/**
	 * Get Date
	 *
	 * Gets the current date id
	 *
	 * @author Reid Workman
	 */
	public function get_date( $nTime = FALSE ) {
			
		if ( is_string($nTime) )
			$nTime = strtotime($nTime);
		
		if ( !$nTime )
			$nTime = time();
			
		$sDate = date('Y-m-d 00:00:00', $nTime);
		
		$this->where( 'league_date', '=', $sDate);
		$a = $this->list()->rows;
		if (isset($a[0])){
			$o = (object)$a[0]->get();
			return $o->date_id;
		}
		
		$this->create(get_user_id(), $sDate);
		
		return $this->get('date_id');
	}
	
	/**
	 * Parse Date
	 *
	 * Similar to php's date_parse() function, this simply adds a little bit more data.
	 *
	 * @author Steve Keylon
	 */
	static function parse_date($sDate) {
		$aDate = date_parse($sDate);
		
		$aDate = array_merge($aDate, getdate(strtotime($sDate)));
		
		$aDate['week'] = date('W', strtotime($sDate));
		$aDate['quarter'] = ceil($aDate['week'] / 13);
		
		// Years have a 53rd week albeit a short one. This is a solution to that
		if ( $aDate['quarter'] > 4 ) $aDate['quarter'] = 4;
		return $aDate;
	}
}

?>