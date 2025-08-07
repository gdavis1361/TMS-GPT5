<?php

class Task_GridController extends AjaxController {

	public function getRecordsAction() {
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);

		// Setup the filtering and query variables
		$start = intval(getParam('start', 0));
		$limit = intval(getParam('limit', 10));

		$userId = get_user_id();

		// build query data
		$fields = array(
			'task_base.*',
			'task_types.task_name',
			'task_types.task_description',
			'task_types.task_url',
			'task_types.task_priority_weight',
			'user_base.user_id',
			'contact_base.first_name',
			'contact_base.last_name',
			"(contact_base.first_name + ' ' + contact_base.last_name) AS assigned_to",
			'user_base2.user_id AS user_id2',
			'contact_base2.first_name AS first_name2',
			'contact_base2.last_name AS last_name2',
			"(contact_base2.first_name + ' ' + contact_base2.last_name) AS created_by",
			'user_roles.role_name'
		);
		$from = array(
			'task_base'
		);
		$join = array(
			'LEFT JOIN task_types ON task_types.task_type_id = task_base.task_type_id',
			'LEFT JOIN user_base ON user_base.user_id = task_base.employee_id',
			'LEFT JOIN contact_base ON contact_base.contact_id = user_base.contact_id',
			'LEFT JOIN user_base AS user_base2 ON user_base2.user_id = task_base.created_by_id',
			'LEFT JOIN contact_base AS contact_base2 ON contact_base2.contact_id = user_base2.contact_id',
			'LEFT JOIN user_roles ON user_roles.role_id = task_base.role_id'
		);

		$adminRoleId = UserRoles::Admin;
		$myRoleId = get_user()->get('role_id');

		$where = array(
			'task_base.completed_at IS NULL'
		);
		if ($myRoleId == $adminRoleId) {
			$where[] = "(task_base.created_by_id = $userId OR task_base.employee_id = $userId OR task_base.employee_id = 0)";
		}
		else {
			$where[] = "(task_base.created_by_id = $userId OR task_base.employee_id = $userId OR (task_base.employee_id = 0 AND task_base.role_id = $myRoleId))";
		}

		$sort = array(
			'created_at DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					case 'status':
						if ($cleanValue > 0) {
							$where[] = "task_types.task_type_id = '$cleanValue'";
						}
						break;

					case 'created_by':
						$where[] = "(contact_base2.first_name LIKE '$cleanValue%' OR contact_base2.last_name LIKE '$cleanValue%')";
						break;

					case 'assigned_to':
						$where[] = "(contact_base.first_name LIKE '$cleanValue%' OR contact_base.last_name LIKE '$cleanValue%')";
						break;

					case 'dueDateOn':
						$ts = strtotime($cleanValue);
						$startDate = date('n/j/y', $ts);
						$ts = strtotime('+1 day', $ts);
						$stopDate = date('n/j/y', $ts);
						$where[] = "task_base.due_at BETWEEN '$startDate' AND '$stopDate'";
						break;

					case 'dueDateFrom':
						$ts = strtotime($cleanValue);
						$date = date('n/j/y', $ts);
						$where[] = "task_base.due_at >= '$date'";
						break;

					case 'dueDateTo':
						$ts = strtotime($cleanValue);
						// Add one day to include this day
						$ts = strtotime('+1 day', $ts);
						$date = date('n/j/y', $ts);
						$where[] = "task_base.due_at <= '$date'";
						break;

					case 'taskOwner':
						switch ($cleanValue) {
							case 'all':
								
								break;

							case 'unclaimed':
								$where[] = "task_base.role_id <> 0 AND task_base.employee_id = 0";
								break;

							case 'me':
								$where[] = "task_base.employee_id = $userId";
								break;

							case 'others':
								$where[] = "task_base.role_id <> 0 AND task_base.employee_id <> $userId AND task_base.employee_id <> 0";
								break;
						}
					break;
				}
			}
		}

		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
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
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);

		for ($i = 0; $i < $numRows; $i++) {
			// check if the user is able to claim the task
			$rows[$i]['canClaim'] = 0;
			if ($rows[$i]['employee_id'] == 0) {
				if ($rows[$i]['claimable'] && ($myRoleId == $adminRoleId || $myRoleId == $rows[$i]['role_id'])) {
					$rows[$i]['canClaim'] = 1;
				}
			}

			$rows[$i]['myId'] = $userId;
			$rows[$i]['due_at'] = date('n/j/y', strtotime($rows[$i]['due_at']));
			$rows[$i]['created_at'] = strtotime($rows[$i]['created_at']);

			$rows[$i]['taskDetails'] = TaskDetails::getTaskDetails($rows[$i]['task_id']);
			$rows[$i]['taskDisplay'] = TaskTypes::replaceTags($rows[$i]['task_description'], $rows[$i]['taskDetails']);
			$rows[$i]['taskUrl'] = TaskTypes::replaceTags($rows[$i]['task_url'], $rows[$i]['taskDetails']);
			$rows[$i]['taskName'] = TaskTypes::replaceTags($rows[$i]['task_name'], $rows[$i]['taskDetails']);
		}

		$this->setParam('records', $rows);
	}

	public function getTaskTypeListAction() {
		$query = "SELECT task_type_id, task_name FROM task_types ORDER BY task_name";
		$records = array(array(
				'task_type_id' => -1,
				'task_name' => 'All'
				));
		$rows = LP_Db::fetchAll($query);
		$records = array_merge($records, $rows);
		$this->setParam('records', $records);
	}

}