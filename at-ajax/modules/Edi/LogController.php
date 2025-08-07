<?php
class Edi_LogController extends CrudController {
	public $model = 'EdiLog';
	public $primaryKey = 'id';
	
	
	public function formatRow($row) {
		if($row['type'] == 204){
			$edi = new Edi_Tender($row['content']);
			
		}
		return parent::formatRow($row);
	}
}