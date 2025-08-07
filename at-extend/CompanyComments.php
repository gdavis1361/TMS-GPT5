<?php 
/**
 * Company Comments
 *
 * @author Steve Keylon
 */
 
class CompanyComments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'company_comments';

	public function create(	$nCompanyId, $nCommentIndex, $nCommentSourceId, $sComment, 
							$sExpirationDate, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCompanyId) ) return FALSE;
		if ( !is_numeric($nCommentIndex) ) return FALSE;
		if ( !is_numeric($nCommentSourceId) ) return FALSE;
		if ( !is_string($sComment) ) return FALSE;
		if ( !is_string($sExpirationDate) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_company_id($nCarrierId);
		$this->set_comment_index($nModeId);
		$this->set_comment_source_id($nCommentSourceId);
		$this->set_comment($sComment);
		$this->set_expiration_date($sExpirationDate);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>