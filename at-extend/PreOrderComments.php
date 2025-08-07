<?php 

/**
 * Pre Order Comments
 *
 * @author Steve Keylon
 */

class PreOrderComments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_comments';
	
	public function create(	$nPreOrderId,
							$sComment,
							$nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nPreOrderId) ) {
			add_error('Pre Order Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_string($sComment) ) {
			add_error('Comment: ' . $sComment, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		
		
		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_comment($sComment);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		
		$this->set_comment_index($this->get_NextIndex($nPreOrderId));

		$this->save();
		// Report
		return true;
	}

	function get_NextIndex($nPreOrderId) {
		$this->clear_filters();
		$this->where('pre_order_id', '=', $nPreOrderId);
		$this->order('comment_index', 'desc');
		$a = $this->list()->rows;
		$o = new PreOrderComments();
		if (isset($a[0]) ) {
			return $a[0]->get_comment_index() + 1;
		}else{
			// No contacts, so give it index #1
			return 1;
		}
	}
}

?>
