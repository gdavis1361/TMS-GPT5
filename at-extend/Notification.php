<?php
class Notification {
	
	static $taskName = 'Notification';
	
	public static function create($userId, $description) {
		// Get the comment type id for "Other"
		$commentType = new ToolsCommentTypes();
		$commentType->load(array(
			'comment_type_name' => 'Other'
		));
		$commentTypeId = $commentType->get('comment_type_id');
		
		// Make a generic comment record not linked to anything
		$commentBase = new CommentBase();
		$commentBase->create($commentTypeId, 1, $description);
		$commentId = $commentBase->get('comment_id');
		
		$createdById = get_user_id();
		$taskDetails = array(
			'comment_id' => $commentId
		);
		
		$taskTypes = new TaskTypes();
		$taskTypes->load(array(
			'task_name' => 'Notification'
		));
		$taskTypeId = $taskTypes->get('task_type_id');
		$task = new TaskBase();
		$task->create($taskTypeId, $userId, time(), $taskDetails, $createdById);
	}
	
}