<?php

class Tools_StatusTypesController extends AjaxController {

	public function listAction() {
		$statusTypes = new ToolsStatusTypes();
		$statusTypes->where('status_group_id', '=', 1);
		$rows = $statusTypes->list()->rows;
		$records = array();
		foreach ($rows as $row) {
			$records[] = (array) $row->get();
		}

		$this->setParam('records', $records);
	}

	public function getFilterListAction() {
		$statusTypes = new ToolsStatusTypes();
		$statusTypes->where('status_group_id', '=', 1);
		$rows = $statusTypes->list()->rows;
		$records = array(array(
			'status_id' => -1,
			'status_name' => 'All'
		));
		foreach ($rows as $row) {
			$records[] = (array) $row->get();
		}
		
		$this->setParam('records', $records);
	}

}