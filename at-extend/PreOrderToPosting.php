<?php
/**
 * Pre Order Posting
 *
 * @author Steve Keylon
 */

class PreOrderToPosting extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_to_posting';

	public function create(	$nPreOrderId, $nPostingId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nPostingId) ) {
			add_error('Posting Id: ' . $nPostingId, $key);
			return FALSE;
		}
		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_posting_id($nPostingId);
		$this->save();
		// Report
		return true;
	}
	
	public static function get_pre_orders( $nPage = 1, $nItemsPerPage = 50 ){
		// for when we implement paging
		$nStart = (($nPage - 1) * $nItemsPerPage) + 1;
		$nEnd = $nPage * $nItemsPerPage;
		$sQuery = "SELECT preorder2posting.posting_id, posting.created_at as posting_created_at, preorder.*, serv.posting_service_name, serv.url 
					FROM pre_order_to_posting preorder2posting
					
					INNER JOIN pre_order_base preorder
					ON preorder2posting.pre_order_id = preorder.pre_order_id
					
					INNER JOIN posting_base posting
					ON posting.posting_id = preorder2posting.posting_id
					
					INNER JOIN posting_to_service posting2service
					ON preorder2posting.posting_id = posting2service.posting_id
					AND posting2service.active = 1
					
					INNER JOIN posting_services serv
					ON posting2service.service_id = serv.posting_service_id
					
					ORDER BY posting.created_at DESC, preorder.pre_order_id";
		$o = new DBModel();
		$o->connect();
		$res = $o->query($sQuery);
		$aReturn = array();
		while( $row = $o->db->fetch_array($res) ){
			$aReturn[] = $row;
		}
		return $aReturn;
	}
}
?>