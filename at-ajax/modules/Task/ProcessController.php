<?php

class Task_ProcessController extends AjaxController {
	
	public function getTaskInfoAction() {
		$userId = get_user_id();
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
		$whereSql = 'WHERE ' . implode(' AND ', $where);
		if (!count($where)) {
			$whereSql = '';
		}
		
		$query = "SELECT COUNT(*) num FROM task_base $whereSql";
		$row = LP_Db::fetchRow($query);
		$num = 0;
		if ($row) {
			$num = $row['num'];
		}
		if ($num) {
			$this->setParam('badgeText', "$num");
		}
		else {
			$this->setParam('badgeText', "");
		}
	}
	
	public function checkNewAction() {
		$userId = get_user_id();
		$newTasks = false;
		if (isset($GLOBALS['oSession'])) {
			$session = $GLOBALS['oSession'];
			$lastCheck = $session->session_var('taskLastCheck');
			
			// If we have checked for a new task already, compare that time to the newest task time
			if ($lastCheck) {
				$task = new TaskBase();
				$newestTask = $task->getNewestTask($userId);
				
				// Make sure there is a task to compare
				if ($newestTask) {
					
					// Compare the newest task created time to the last session check
					$newestTaskTime = strtotime($newestTask['created_at']);
					$this->setParam('info', 'compare ' . $newestTaskTime . ' to ' . $lastCheck);
					$this->setParam('task', $newestTask);
					if ($newestTaskTime > $lastCheck) {
						$newTasks = true;
						$this->setParam('title', 'New Task');
						$this->setParam('content', 'A new task is available');
						$this->setParam('url', '/dashboard.php');
						$this->setParam('icon', '/resources/icons/task-32.png');
					}
				}
			}
			
			$lastCheck = time();
			$lastCheck = $session->session_var('taskLastCheck', $lastCheck);
			$session->session_save();
		}
		
		$this->setParam('newTasks', $newTasks);
	}
	
	public function getDetailsAction() {
		$taskId = intval(post('taskId', 0));
		$task = new TaskBase();
		$task->load($taskId);
		$taskTypeId = $task->get('task_type_id');
		$details = array();
		if ($taskId) {
			$query = "SELECT task_details_type_name, task_details_value, task_details.task_details_type_id
				FROM task_details, task_details_types
				WHERE task_details.task_details_type_id = task_details_types.task_details_type_id
				AND task_id = $taskId";
			$rows = LP_Db::fetchAll($query);
			for ($i = 0; $i < count($rows); $i++) {
				$details[$rows[$i]['task_details_type_name']] = $rows[$i]['task_details_value'];
			}
		}
		$this->setParam('details', $details);
		$this->setParam('cls', TaskBase::getDashboardTaskClass($taskTypeId));
	}
	
	public function claimTaskAction() {
		$taskId = intval(getParam('taskId', 0));
		if ($taskId) {
			// claim the task
			$taskBase = new TaskBase($taskId);
			if (!$taskBase->get('employee_id')) {
				$taskBase->set('employee_id', get_user_id());
				$taskBase->set('started_at', time());
				$taskBase->save();
			}
		}
	}
	
	public function completeTaskAction() {
		$taskId = intval(getParam('taskId', 0));
		if ($taskId) {
			$task = new TaskBase($taskId);
			$task->complete();
		}
	}
	
	public function getCommentAction() {
		$commentId = intval(getParam('comment_id', 0));
		$commentBase = new CommentBase($commentId);
		$this->setParam('comment', $commentBase->get('comment'));
	}
	
}