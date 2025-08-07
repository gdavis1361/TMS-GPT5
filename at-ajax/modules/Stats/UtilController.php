<?php

class Stats_UtilController extends AjaxController {

	public function statTypesAction(){
		$statTypes = array(
			array(
				"title" => "Points",
				"field" => "points"
			),
			array(
				"title" => "Margin",
				"field" => "margin"
			),
			array(
				"title" => "Total Contacts",
				"field" => "total_contacts"
			),
			array(
				"title" => "Up to Date Contacts",
				"field" => "up_to_date_contacts"
			),
		);
		$this->setParam("records", $statTypes);
	}
	
	public function usersAction(){
		
	}
}