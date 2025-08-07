<?php
class Order_PostingController extends AjaxController {
	
	public function getAction(){
		//Setup any data we need to run this query
		$session = $GLOBALS['oSession'];
		
		//Setup the filtering and query variables
		$start = request("start", 0);
		$limit = request("limit", 10);
		$sort = array(
			'posting_created_at DESC',
			'pre_order_id'
		);
		$where = "1=1";
		$filter = json_decode(request("filter", json_encode(array())), true);
		
		/*
		 * $sQuery = "SELECT preorder2posting.posting_id, posting.created_at as posting_created_at, preorder.*, serv.posting_service_name, serv.url 
					FROM pre_order_to_posting preorder2posting
					
					INNER JOIN pre_order_base preorder
					ON preorder2posting.pre_order_id = preorder.pre_order_id
					
					INNER JOIN posting_base posting
					ON posting.posting_id = preorder2posting.posting_id
					
					INNER JOIN posting_to_service posting2service
					ON preorder2posting.posting_id = posting2service.posting_id
					AND posting2service.active = 1
					
					INNER JOIN posting_services serv
					ON posting2service.service_id = serv.posting_service_id
					
					ORDER BY posting.created_at DESC, preorder.pre_order_id";
		 */
		
		//Create all the fields
		$fields = array(
			'preorder2posting.posting_id',
			'posting.created_at posting_created_at',
			'preorder.*',
			'serv.posting_service_name',
			'serv.url'
		);
		$fields = implode(', ', $fields);
		
		//create the from
		$from = "pre_order_to_posting preorder2posting
					INNER JOIN
						pre_order_base preorder
					ON 
						preorder2posting.pre_order_id = preorder.pre_order_id
					INNER JOIN
						posting_base posting
					ON 
						posting.posting_id = preorder2posting.posting_id
					INNER JOIN
						posting_to_service posting2service
					ON 
						preorder2posting.posting_id = posting2service.posting_id
					AND 
						posting2service.active = 1
					INNER JOIN 
						posting_services serv
					ON 
						posting2service.service_id = serv.posting_service_id";
		
		//Process the sort
		if(isset($_REQUEST['sort'])){
			$sort = array();
			$sortArray = json_decode($_REQUEST['sort'], true);
			foreach ($sortArray as $sortItem){
				$sort[] = $sortItem['property'] . " " . $sortItem['direction'];
			}
		}
		
		//Process any filters
		foreach($filter as $key => $value){
			if(!strlen($value)){
				continue;
			}
		}
		
		//Build the order/sort
		if(count($sort)){
			$sort = implode(",\n", $sort);
		}
		else{
			$sort = '';
		}
		
		//Get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$row = LP_Db::fetchRow($query);
		if($row){
			$this->setParam("total", $row['total']);
		}

		//Run the query and get the results
		$query = "SELECT $fields FROM $from WHERE $where";
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		$records = array();
		$preOrderIds = array();
		foreach ($rows as $row){
			//Format the date
			$row['posting_created_at'] = date('F j, Y', strtotime($row['posting_created_at']));
			
			//Add the row to the records
			$records[] = $row;
			
			//Add preorderid
			if(!in_array($row['pre_order_id'], $preOrderIds)){
				$preOrderIds[] = $row['pre_order_id'];
			}
		}
		
		$summaryRecords = array();
		foreach ($preOrderIds as $preOrderId){
			$summaryRecords[] = array(
				"pre_order_id" => $preOrderId
			);
		}
		$this->setParam("summaryData", $summaryRecords);
		
		//Add the records to the response
		$this->setParam("records", $records);
	}
}