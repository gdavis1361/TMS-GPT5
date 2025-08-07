<?php
class Calendar_ProcessController extends AjaxController {
	public function calendarAction(){
		$records = array(
			array(
				"id" => 1,
				"title" => "Call",
				"color" => 2
			),
			array(
				"id" => 2,
				"title" => "Email",
				"color" => 19
			),
			array(
				"id" => 3,
				"title" => "Visit",
				"color" => 27
			)
		);
		
		$this->setParam("records", $records);
	}
	
	public function eventAction() {
		$userId = get_user_id();
		$startDate = request("startDate", date("Y-m-d", strtotime("-1 month")));
		$endDate = request("endDate", date("Y-m-d", strtotime("+1 month")));
		$where = "1=1";
		$where .= " AND owner_id = '$userId'";
		
		//Add any filters
		if(isset ($_REQUEST['contact_id'])){
			$contactId = intval($_REQUEST['contact_id']);
			$where .= " AND owners.contact_id = '$contactId'";
		}
		
		$query = "SELECT 
					contact.*,
					detail.next_call,
					detail.next_email,
					detail.next_visit
					FROM contact_owners owners
					LEFT JOIN
						contact_customer_detail detail
					ON
						detail.contact_id = owners.contact_id
					LEFT JOIN
						contact_base contact
					ON detail.contact_id = contact.contact_id
					WHERE $where";
					//AND detail.next_call BETWEEN '$startDate' AND '$endDate'
					//OR detail.next_email BETWEEN '$startDate' AND '$endDate'
					//OR detail.next_visit BETWEEN '$startDate' AND '$endDate'";
		$rows = LP_Db::fetchAll($query);
		$records = array();
		$count = 0;
		foreach ($rows as $row){
			$record = array(
				"id" => $count++,
				"cid" => 1,
				"title" => "Call " . $row['first_name'] . " " . $row['last_name'],
				"start" => date("Y-m-d", strtotime($row['next_call'])),
				"end" => date("Y-m-d", strtotime($row['next_call'])),
				"ad" => true
			);
			$records[] = $record;
			$record = array(
				"id" => $count++,
				"cid" => 2,
				"title" => "Email " . $row['first_name'] . " " . $row['last_name'],
				"start" => date("Y-m-d", strtotime($row['next_email'])),
				"end" => date("Y-m-d", strtotime($row['next_email'])),
				"ad" => true
			);
			$records[] = $record;
			$record = array(
				"id" => $count++,
				"cid" => 3,
				"title" => "Visit " . $row['first_name'] . " " . $row['last_name'],
				"start" => date("Y-m-d", strtotime($row['next_visit'])),
				"end" => date("Y-m-d", strtotime($row['next_visit'])),
				"ad" => true
			);
			$records[] = $record;
		}
		$this->setParam("records", $records);
	}
}