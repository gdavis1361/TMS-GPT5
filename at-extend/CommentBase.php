<?php 
 
class CommentBase extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'comment_base';

	public function create($commentTypeId, $fieldValue, $comment) {
		$commentTypeId = intval($commentTypeId);
		$fieldValue = intval($fieldValue);
		$comment = trim($comment);
		
		if (!$fieldValue) {
			$this->addError('No entity selected for the comment');
		}
		if (!$commentTypeId) {
			$this->addError('Please select a comment type');
		}
		if (!strlen($comment)) {
			$this->addError('Please enter a comment');
		}
		
		if (!$this->anyErrors()) {
			$myId = get_user_id();
			$this->set('field_value', $fieldValue);
			$this->set('comment_type_id', $commentTypeId);
			$this->set('comment', $comment);
			
			if ($this->get('created_by_id')) {
				$this->set('updated_by_id', $myId);
				$this->set('updated_at', time());
			}
			else {
				$this->set('created_by_id', $myId);
				$this->set('created_at', time());
			}
			$this->save();
		}
	}
}