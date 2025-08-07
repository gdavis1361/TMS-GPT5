<?php

class Document_TaskController extends AjaxController {
	
	public function checkScannersAction() {
		$documentBase = new DocumentBase();
		$documentBase->checkScannedDocuments();
	}
	
}