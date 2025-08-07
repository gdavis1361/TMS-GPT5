<?php 
/**
 * Claim Comments
 *
 * @author Steve Keylon
 */
 
class ClaimComments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'claim_comments';

	public function create(	$nClaimId, $nCommentIndex, $nCommentSourceId, $sComment, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nClaimId) ) return FALSE;
		if ( !is_numeric($nCommentIndex) ) return FALSE;
		if ( !is_numeric($nCommentSourceId) ) return FALSE;
		if ( !is_string($sComment) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_claim_id($nClaimId);
		$this->set_comment_index($nCommentIndex);
		$this->set_comment_source_id($nCommentSourceId);
		$this->set_comment($sComment);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>