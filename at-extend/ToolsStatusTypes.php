<?php 
/**
 * Tools Status Types
 *
 * @author Reid Workman
 */
 
class ToolsStatusTypes extends DBModel {
	
	const OrderAvailable = 1;
	const OrderCovered = 2;
	const OrderInProgress = 3;
	const OrderDelivered = 4;
	const OrderInAudit = 5;
	const OrderProcessed = 6;
	const OrderBilled = 7;
	const OrderCollected = 8;
	const Cold = 9;
	const Warm = 10;
	const Hot = 11;
	
	const AccountingType = 8;

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_status_types';

	public function create(	$nStatusGroupId, $sStatusName, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nStatusGroupId) ) return FALSE;
		if ( !is_string($sStatusName) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'status_group_id', $nStatusGroupId );
		$this->set( 'status_name', $sStatusName );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
	/*
	 * Make List will make a html list of all status types within a given group id
	 * 
	 * @author Steve Keylon
	 * 
	 * @param $nGroupId int Group of Status Types to use.
	 * @param $sName string Value to be given to the name attribute of the HTML select element
	 * @param $nDefault=0 int Id of the default StatusType to be selected
	 * @param $sClass="" string Value to be given to the class attribute of the HTML select element
	 * @param $sId="" string Value to be given to the id attribute of the HTML select element
	 * @param $vHideBlank=false boolean Whether to provide an empty first element in the list
	 * 
	 * @return String of HTML for the select element and all options provided. 
	 */
	
	function make_list($nGroupId, $sName, $nDefault=0, $sClass="", $sId="", $vHideBlank=false) {
		$html = "<select name=\"$sName\" class=\"$sClass\" id=\"$sId\">";
		$html .= $vHideBlank ? '' : "<option value=\"\"> -- </option>";
		
		$this->clear_filters();
		$this->where('status_group_id', '=', $nGroupId);
		$a = $this->list()->rows;
		$a = array_map(function($o){return $o->get();}, $a );
		
		foreach($a as $row){
			$html .=	"<option value='" . $row['status_id'] . "' " . 
					($nDefault == $row['status_id'] ? "selected='selected'" : "" ) . ">" . 
						$row['status_name'] . 
					"</option>";
		}
		$html .= "</select>";
		
		return $html;
	}
}