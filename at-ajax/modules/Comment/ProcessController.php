<?php

/**
 * Description of ProcessController
 *
 * @author Steve Keylon
 */
class Comment_ProcessController extends AjaxController {

	public function getCommentTypesAction() {
		$commentType = getParam('commentType', 'contact');
		$nGroupId = 0;
		switch($commentType) {
			case 'contact':
				$nGroupId = ToolsCommentTypes::Contacts;
			break;
			
			case 'customer':
				$nGroupId = ToolsCommentTypes::Company;
			break;
			
			case 'carrier':
				$nGroupId = ToolsCommentTypes::Carriers;
			break;
			
			case 'order':
				$nGroupId = ToolsCommentTypes::Orders;
			break;
			
		}
		
		$records = array();
		
		$user = get_user();
		$myRoleId = $user->get('role_id');
		
		if ($myRoleId == UserRoles::Broker || $myRoleId == UserRoles::PodLoader) {
			// Show sales call first for brokers
			$query = "SELECT comment_type_id, comment_type_name
				FROM tools_comment_types
				WHERE
					comment_group_id = $nGroupId
					AND comment_type_name = 'Sales Call'
				ORDER BY comment_type_name";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$records[] = $rows[$i];
			}
			
			$query = "SELECT comment_type_id, comment_type_name
				FROM tools_comment_types
				WHERE
					comment_group_id = $nGroupId
					AND comment_type_name <> 'Sales Call'
				ORDER BY comment_type_name";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$records[] = $rows[$i];
			}
		}
		else if ($myRoleId == UserRoles::Billing || $myRoleId == UserRoles::CreditAndCollections || $myRoleId == UserRoles::Auditing || $myRoleId == UserRoles::CashApplication) {
			// Show billing call first for billing user
			$query = "SELECT comment_type_id, comment_type_name
				FROM tools_comment_types
				WHERE
					comment_group_id = $nGroupId
					AND comment_type_name = 'Billing Call'
				ORDER BY comment_type_name";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$records[] = $rows[$i];
			}
			
			$query = "SELECT comment_type_id, comment_type_name
				FROM tools_comment_types
				WHERE
					comment_group_id = $nGroupId
					AND comment_type_name <> 'Billing Call'
				ORDER BY comment_type_name";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$records[] = $rows[$i];
			}
		}
		else {
			$query = "SELECT comment_type_id, comment_type_name
				FROM tools_comment_types
				WHERE
					comment_group_id = $nGroupId
				ORDER BY comment_type_name";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$records[] = $rows[$i];
			}
		}
		
		$this->setParam('records', $records);
	}
	
	public function saveCommentAction() {
		$fieldValue = intval(getPostParam('field_value', 0));
		$commentId = intval(getPostParam('comment_id', 0));
		$commentTypeId = intval(getPostParam('comment_type_id', 0));
		$commentValue = trim(getPostParam('comment', ''));
		$comment = new CommentBase();
		$comment->load($commentId);
		$comment->create($commentTypeId, $fieldValue, $commentValue);
		if ($comment->anyErrors()) {
			$comments = $comment->getErrors();
			for ($i = 0; $i < count($comments); $i++) {
				$this->addError($comments[$i]);
			}
		}
		else {
			$this->setParam('comment_id', $comment->get('comment_id'));
			
			$sType = 0;
			if ( in_array( $commentTypeId, ToolsCommentTypes::ContactCommentTypes('call') ) ){
				$sType = 'call';
			}else if ( in_array($commentTypeId, ToolsCommentTypes::ContactCommentTypes('email') ) ) {
				$sType = 'email';
			}else if ( in_array($commentTypeId, ToolsCommentTypes::ContactCommentTypes('visit') ) ) {
				$sType = 'visit';
			}
			
			if ($sType) {
				$o = new ContactCustomerDetail();
				$o->load($fieldValue);
				$o->markUpToDate($sType);
			}
			
		}
	}
	
	public function getGridRecordsAction() {
		// get submitted params
		$type = getParam('type', 'contact');
		$fieldValue = intval(getParam('field_value', 0));
		
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(request('start', 0));
		$limit = intval(request('limit', 10));
		
		// build query data
		$fields = array(
			'comment_base.*',
			'tools_comment_types.comment_type_name',
			'contact_base.first_name created_by_first_name',
			'contact_base.last_name created_by_last_name'
		);
		$from = array(
			'comment_base'
		);
		$join = array(
			'LEFT JOIN tools_comment_types ON tools_comment_types.comment_type_id = comment_base.comment_type_id',
			'LEFT JOIN tools_comment_groups ON tools_comment_groups.comment_group_id = tools_comment_types.comment_group_id',
			'LEFT JOIN user_base ON user_base.user_id = comment_base.created_by_id',
			'LEFT JOIN contact_base ON contact_base.contact_id = user_base.contact_id'
		);
		$where = array(
			"comment_base.field_value = $fieldValue"
		);
		$sort = array(
			'comment_id DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}
		
		// apply filter based on type of order display
		$commentGroupId = 0;
		switch($type) {
			case 'contact':
				$commentGroupId = ToolsCommentTypes::Contacts;
				$fields[] = '(contact_base2.first_name + \' \' + contact_base2.last_name) AS field_display';
				$join[] = 'LEFT JOIN contact_base contact_base2 ON contact_base2.contact_id = comment_base.field_value';
				
				// check if we need to show all contacts for this company
				if (isset($filter['showAll'])) {
					// get the contact customer id
					$customerId = 0;
					$query = "SELECT customer_id FROM customer_to_location
						LEFT JOIN location_to_contact ON location_to_contact.location_id = customer_to_location.location_id
						WHERE location_to_contact.contact_id = $fieldValue";
					$row = LP_Db::fetchRow($query);
					$customerId = $row['customer_id'];
					
					$where = array();
					$where[] ="comment_base.field_value <> 0";
					$join[] = "LEFT JOIN location_to_contact ON location_to_contact.contact_id = contact_base2.contact_id";
					$join[] = "LEFT JOIN customer_to_location ON customer_to_location.location_id = location_to_contact.location_id";
					$where[] = "customer_to_location.customer_id = $customerId";
				}
				else {
					
				}
			break;
			
			case 'carrier':
				$commentGroupId = ToolsCommentTypes::Carriers;
				$fields[] = 'ContractManager.dbo.CarrierMaster.CarrName AS field_display';
				$join[] = 'LEFT JOIN ContractManager.dbo.CarrierMaster ON ContractManager.dbo.CarrierMaster.CarrID = comment_base.field_value';
			break;
		
			case 'customer':
				$commentGroupId = ToolsCommentTypes::Company;
				$fields[] = 'customer_base.customer_name AS field_display';
				$join[] = 'LEFT JOIN customer_base ON customer_base.customer_id = comment_base.field_value';
			break;
		
			case 'order':
				$commentGroupId = ToolsCommentTypes::Orders;
				$fields[] = "comment_base.field_value AS field_display";
				
			break;
		}
		$where[] = "tools_comment_groups.comment_group_id = $commentGroupId";
		
		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
		
		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					
				}
			}
		}
		
		$whereSql = 'WHERE ' . implode(' AND ', $where); 
		if (!count($where)) {
			$whereSql = '';
		}
		$sortSql = implode(',', $sort);
		
		// get total count
		$total = 0;
		$totalQuery = "SELECT COUNT(*) total $fromSql $joinSql $whereSql ";
		$row = LP_Db::fetchRow($totalQuery);
		if ($row) {
			$total = $row['total'];
		}
		$this->setParam('total', $total);
		
		// get records
		$query = "SELECT $fieldsSql $fromSql $joinSql $whereSql ";
		$this->setParam('query', $query);
		$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		$this->setParam('query2', $query);
		$rows = LP_Db::fetchAll($query);
		
		$this->setParam('records', $rows);
	}
}