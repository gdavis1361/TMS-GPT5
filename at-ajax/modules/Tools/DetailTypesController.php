<?php
class Tools_DetailTypesController extends AjaxController {
	public function listAction(){
		$detailTypes = new ToolsDetailTypes();
		$detailTypes->where('detail_group_id', '=', 2);
		$rows = $detailTypes->list()->rows;
		$records = array();
		foreach($rows as $row){
			$records[] = (array)$row->get();
		}
		
		$this->setParam("records", $records);
	}
}