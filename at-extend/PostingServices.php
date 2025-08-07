<?php 
/**
 * Static class mapping fields
 * @author jaredtlewis
 *
 */
class PostingServices_Fields {
	const Id = 'posting_service_id';
	const Name = 'posting_service_name';
	const Url = 'url';
	const CreatedBy = 'created_by_id';
	const CreatedAt = 'created_at';
	const UpdatedBy = 'updated_by_id';
	const UpdatedAt = 'updated_at';
}

/**
 * 
 * Posting Services Database Model
 * @author jaredtlewis
 *
 */
class PostingServices extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'posting_services';

	public function create( $sPostingServiceName, $sUrl, $nCreatedById ) {
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nCustomerId) ) {
			add_error('Customer id: '. $nCustomerId, $key);
			return FALSE;
		}
		if ( !validateURL( $sUrl ) ) {
			add_error('Url must be a valid url: ' . $sUrl, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		
		// Save Input
		$this->set_posting_service_name( addslashes( $sPostingServiceName ) );
		$this->set_url( $sUrl );
		$nCreatedById = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		$this->save();
		
		// Report
		return true;
	}
	
	/**
	 * make a list of HTML checkboxes for each posting_service row
	 * @param int $nColumns the number of columns to separate the checkboxes into
	 * @param $vChecked should the checkboxes be checked initially
	 * @return the html string
	 */
	public static function make_services_list( $nColumns = 1, $vChecked = true ){
		if( !is_numeric( $nColumns ) ) $nColumns = 1;
		
		$o = new DBModel();
		$o->connect();
		$sQuery = "SELECT * FROM posting_services";
		$res = $o->query( $sQuery );

		// calculate for column count
		$nNumItems = $o->db->num_rows( $res ); // the number of items
		$nNumColItems = (int)( $nNumItems / $nColumns ); // how many items should be in each column
		$nNumLargerCol = 10000000;
		if( $nNumItems % $nColumns > 0 ){ // if num items in each column not equal
			$nNumLargerCol = $nNumItems % $nColumns; // how many cols will have more items
			$nNumColItems++;
		}
		$nRowCount = 0; // how many items in a column have I done so far
		$nDoneColumns = 0; // the num of columns done so far
		$sReturnHTML = '<div class="boxleft">';

		while( $row = $o->db->fetch_array($res) ){
			if( $nColumns > 1 && $nRowCount > 0 && ( $nRowCount % $nNumColItems ) == 0 ){
				$sReturnHTML .= "</div>\n<div class=\"boxleft\">";
				$nRowCount = 0;
				$nDoneColumns++;
				if( $nDoneColumns == $nNumLargerCol )
					$nNumColItems--;
			}
			$sReturnHTML .= '<input type="checkbox" name="posting_service_id[]" value="'.$row['posting_service_id'].'"';
			if( $vChecked )
				$sReturnHTML .= ' checked="checked"';
			$sReturnHTML .= '/> '.$row['posting_service_name']."<br/>\n";
			$nRowCount++;
		}
		$sReturnHTML .= '</div>';
		return $sReturnHTML;
	}

	function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();

		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"".$row->mode_id.'"'.( ($nDefault == $row->posting_service_id) ? ' selected="selected"' : '' ).'>'.$row->posting_service_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
}

?>