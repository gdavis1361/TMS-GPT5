<?php

/**
 * @author Reid Workman
 */
class TaskBase extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'task_base';

	public function create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById, $roleId = 0, $claimable = 1) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;

		if (!number($nTaskTypeId, TRUE)) {
			add_error('You must provide a Task Type Id', $key);
			return FALSE;
		}
		if (!number($nEmployeeId, TRUE)) {
			add_error('You must provide an Employee Id', $key);
			return FALSE;
		}
		if ($nDueAt && !number($nDueAt, TRUE)) {
			add_error('You must provide a valid UNIX timestamp for Due Date', $key);
			return FALSE;
		}

		if (!number($nCreatedById, TRUE)) {
			add_error('You must provide a Created By Id', $key);
			return FALSE;
		}
		$roleId = intval($roleId);

		// Save Data
		$this->clear();
		$this->set('task_type_id', $nTaskTypeId);
		$this->set('employee_id', $nEmployeeId);
		$this->set('due_at', $nDueAt);

		$this->set('created_at', time());
		$this->set('created_by_id', $nCreatedById);
		
		$this->set('role_id', $roleId);
		$this->set('claimable', $claimable);

		$this->save();

		$aTaskDetails['task_id'] = $this->get('task_id');
		foreach ($aTaskDetails as $sType => $nValueId) {
			$oTaskDetails = new TaskDetails();
			$oTaskDetails->create($this->get('task_id'), $sType, $nValueId, $nCreatedById);
		}
		
		$this->notifyUser($nEmployeeId);

		// Report
		return true;
	}
	
	public function notifyUser($userId) {
		$url = 'http://accessresults.com:8080/send/tasks/alert';
		$params = array(
			"data" => json_encode(array(
				"title" => "New Task",
				"content" => "A new task is available",
				"url" => "/dashboard.php",
				"icon" => "/resources/icons/task-32.png"
			)),
			"keys" => json_encode(array(
				"userId" => $userId
			))
		);
		LP_Util::curlPost($url, $params);
	}

	public function replace_dynamic_variables($sString) {
		//$sString
	}

	public function delete_task($aTaskIds) {
		if (!is_array($aTaskIds)) {
			$aTaskIds = array($aTaskIds);
		}
		if (count($aTaskIds) < 0) {
			// No id's to match
			return FALSE;
		}

		// Delete Tasks
		$this->delete($aTaskIds);

		// Details
		$oTaskDetails = new TaskDetails();
		$oTaskDetails->delete($aTaskIds);
		return TRUE;
	}

	public function getNewestTask($userId) {
		$userId = intval($userId);
		$this->connect();
		$query = "SELECT TOP 1 task_base.* FROM task_base WHERE employee_id = $userId AND completed_at IS NULL ORDER BY created_at DESC";
		$result = $this->query($query);
		$row = false;
		if (mssql_num_rows($result)) {
			$row = mssql_fetch_assoc($result);
		}

		return $row;
	}

	/**
	 * Returns an array of overdue, current, and future events for a given user
	 * @param int $userId
	 * @return array
	 */
	public static function getUserTasks($userId) {
		$userId = intval($userId);

		$today = mktime(0, 0, 0);
		$tomorrow = strtotime('+1 day', $today);
		$todayDateTime = date("m/d/Y h:i:s A", $today);
		$tomorrowDateTime = date("m/d/Y h:i:s A", $tomorrow);
		
		$tasks = array();
		$groups = array(
			'overdue' => "AND due_at <= '$todayDateTime'",
			'current' => "AND due_at BETWEEN '$todayDateTime' AND '$tomorrowDateTime'",
			'upcoming' => "AND due_at >= '$tomorrowDateTime'"
		);
		$groups = array(
			'forUser' => " AND employee_id = $userId",
			'byUser' => " AND task_base.created_by_id = $userId AND employee_id <> $userId"
		);
		
		foreach ($groups as $key => $filter) {
			$tasks[$key] = array();
			$query = "
				SELECT
					task_base.*,
					task_types.task_type_id, task_types.task_name, task_types.task_description, task_types.task_url, task_types.is_widget, task_types.task_priority_weight,
					contact_base.first_name, contact_base.last_name, 
					contact_base2.first_name AS first_name2, contact_base2.last_name AS last_name2
				FROM task_base, task_types, contact_base, contact_base AS contact_base2, user_base, user_base AS user_base2
				WHERE
					task_base.task_type_id = task_types.task_type_id
					AND task_base.employee_id = user_base.user_id
					AND user_base.contact_id = contact_base.contact_id
					AND task_base.created_by_id = user_base2.user_id
					AND user_base2.contact_id = contact_base2.contact_id
					AND completed_at IS NULL
					$filter
				ORDER BY created_at DESC";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$tasks[$key][] = self::prepareDisplayData($rows[$i]);
			}
		}

		return $tasks;
	}

	private static function prepareDisplayData($row) {
//		$row['timeDifference'] = LP_Util::timeDifference(strtotime($row['due_at']));
		$row['taskDetails'] = TaskDetails::getTaskDetails($row['task_id']);
		$row['taskDisplay'] = TaskTypes::replaceTags($row['task_description'], $row['taskDetails']);
		$row['taskUrl'] = TaskTypes::replaceTags($row['task_url'], $row['taskDetails']);
		$row['taskName'] = TaskTypes::replaceTags($row['task_name'], $row['taskDetails']);
		
		return $row;
	}

	/**
	 * return the task_type_id given a task_name
	 */
	public static function get_task_id_by_task_name($sTaskName) {
		if ($sTaskName == '')
			return 0;
//		$sTaskName = addslashes( $sTaskName );
		$sTaskName = addslashes(addslashes($sTaskName));
		$sQuery = "SELECT task_type_id FROM task_types WHERE task_name LIKE '$sTaskName'";
		$o = new DBModel();
		$o->connect();
		$res = $o->query($sQuery);
		$row = $o->db->fetch_array($res);
		return $row[0]; // should only ever get one result
	}

	/**
	 * This gets fired when a new contact (customer or carrier) is created
	 * @param string $event
	 * @param ContactBase $contactBase
	 * @return array
	 */
	public static function contactAdd($event, $contactBase) {
		// Check the contact_type_id field to see what kind of contact type
		// 2 = Customer
		// 3 = Carrier
		$row = $contactBase->getRow();
		$modifiedRow = $contactBase->getModifiedRow();
		if ($row['contact_type_id'] == 2) {
			
		}
		else if ($row['contact_type_id'] == 3) {
			
		}
	}
	
	
	/**
	 *
	 * @param int $matchId the user_id or role_id
	 * @param int $typeId task type id
	 * @param array $taskDetails array of task details to match on
	 * @param string $matchField employee_id or role_id
	 * @return type 
	 */
	public static function findTask($matchId, $typeId, $taskDetails = array(), $matchField = 'employee_id') {
		// get task ids for this user of this type
		$query = "SELECT task_id FROM task_base WHERE task_type_id = $typeId AND $matchField = $matchId AND completed_at IS NULL";
		if ($matchId == -1) {
			$query = "SELECT task_id FROM task_base WHERE task_type_id = $typeId AND $matchField > 0 AND completed_at IS NULL";
		}

		$rows = LP_Db::fetchAll($query);
		$taskIds = array();
		for ($i = 0; $i < count($rows); $i++) {
			$taskIds[] = $rows[$i]['task_id'];
		}
		
		// get type ids of fields
		$fields = array();
		foreach($taskDetails as $key => $value) {
			$fields[] = $key;
		}
		$fieldsSql = "'" . implode("','", $fields) . "'";
		$query = "SELECT * FROM task_details_types
			WHERE task_details_type_name IN ($fieldsSql)";
		$rows = LP_Db::fetchAll($query);
		$typeIdMap = array();
		for ($i = 0; $i < count($rows); $i++) {
			$typeIdMap[$rows[$i]['task_details_type_name']] = $rows[$i]['task_details_type_id'];
		}
		
		$filter = array();
		foreach($taskDetails as $key => $value) {
			$typeId = $typeIdMap[$key];
			$filter[] = "(task_details_type_id = $typeId AND task_details_value = '$value')";
		}
		
		$numDetails = count($taskDetails);
		for ($i = 0; $i < count($taskIds); $i++) {
			$taskId = $taskIds[$i];
			$query = "SELECT COUNT(*) num FROM task_details
				WHERE task_id = $taskId
				AND (" . implode(' OR ', $filter) . ')';
			$row = LP_Db::fetchRow($query);
			if ($row['num'] == $numDetails) {
				return array('task_id' => $taskId);
			}
		}
		
		return false;
	}

	public static function carrierSave($event, $carrierBase) {
		// For contacts carriers, create task for MC number to be associated to a Pay To
	}

	public static function preOrderConvert($event, $preOrderBase, $orderBase) {
		// When converting a pre order to an order, the status will be set as Available (1)
		// so add a task to find a carrier
	}

	/**
	 *
	 * @param string $event
	 * @param OrderBase $orderBase 
	 */
	public static function orderInsert($event, $orderBase) {
		return;

		// If any information is missing - create a task to complete the order information
	}

	/**
	 *
	 * @param string $event
	 * @param OrderBase $orderBase 
	 */
	public static function orderUpdate($event, $orderBase) {
		return;
		$taskBase = new TaskBase();

		// Check if the order is still not complete
		// Add task is information is missing
		// Remove task to complete information if it exists and the information is complete
		// Check status id change
		$oldStatusId = $orderBase->m_aLoadedValues[$orderBase->m_sTableName]['status_id'];
		$newStatusId = $orderBase->m_aModifiedValues[$orderBase->m_sTableName]['status_id'];
		if ($oldStatusId != $newStatusId) {
			switch ($newStatusId) {
				// If status changes from Available (1) to Covered (2), add task to check call for pickup
				case ToolsStatusTypes::OrderCovered:
//					$taskBase->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById);
					break;

				// If status changes to In Progress (3) create task to check call for delivery
				case ToolsStatusTypes::OrderInProgress:
//					$taskBase->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById);
					break;

				// If status changes to Delivered (4), no new task
				case ToolsStatusTypes::OrderDelivered:
					break;

				// If status changes to In Audit (5) create task to audit the order
				case ToolsStatusTypes::OrderInAudit:
//					$taskBase->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById);
					break;

				// If status changes to Processed / Ready for Billing (6) create task for invoice
				case ToolsStatusTypes::OrderProcessed:
//					$taskBase->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById);
					break;

				// If status changes to Billed (7) create task to make collection call - keep calling until they apply check
				case ToolsStatusTypes::OrderBilled:
//					$taskBase->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById);
					break;

				// If status changes to Collected (8), no new task
				case ToolsStatusTypes::OrderCollected:
					break;

				default:
					break;
			}
		}
		pre($orderBase);
	}
	
	public static function getDashboardTaskClass($typeId) {
		$cls = '';
		switch($typeId) {
			
			// confirm contact transfer
			case 10:
				$cls = 'TMS.contacts.forms.sections.Transfer';
			break;
			
			case 19:
				$cls = 'TMS.orders.forms.sections.Audit';
			break;
		
			case 25:
				$cls = 'TMS.orders.forms.sections.AuditCorrection';
			break;
		
			case 20:
				$cls = 'TMS.orders.forms.sections.Invoice';
			break;
			
			case 26:
				$cls = 'TMS.carrier.forms.sections.Audit';
			break;
			
			case 22:
				$cls = 'TMS.orders.forms.sections.Collected';
			break;
			
			case 28:
				$cls = 'TMS.task.forms.sections.Notification';
			break;
			
		}
		return $cls;
	}
	
	public function complete() {
		$this->set('completed_at', time());
		$this->save();
	}

}