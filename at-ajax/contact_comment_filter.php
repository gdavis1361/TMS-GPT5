<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$aVars = $_POST;

if (empty($aVars['contact_id']) ) die();

$sDateStart = !empty($aVars['date_start']) ? date('Y-m-d', strtotime($aVars['date_start']) ) : '';
$sDateTimeStart = !empty($aVars['date_start']) ? $sDateStart . ' 00:00:00.000' : '';

$sDateEnd = !empty($aVars['date_end']) ? date('Y-m-d', strtotime($aVars['date_end']) ) : '';
$sDateTimeEnd = !empty($aVars['date_end']) ? $sDateEnd . ' 23:59:59.999' : '';

if ( empty($sDateStart) ) {
	$sDateOperator = '<=';
} else if ( empty($sDateEnd) ) {
	$sDateOperator = '>=';
}

$o = new DBModel();
$o->connect();

$aVars = array_map(function ($value) { global $o; return empty($value) ? '' : $o->db->sql_escape($value); }, $aVars);
$sDateTimeEnd = !empty($sDateTimeEnd) ? $o->db->sql_escape($sDateTimeEnd) : '';
$sDateTimeStart = !empty($sDateTimeStart) ? $o->db->sql_escape($sDateTimeStart) : '';

$aWhere = array();

if ( isset($sDateOperator) && (!empty($sDateTimeStart) || !empty($sDateTimeEnd) ) ) {
	$aWhere[] = "comment.created_at " . $sDateOperator . " " . (empty($sDateTimeStart) ? $sDateTimeEnd : $sDateTimeStart);
}else if ( !empty($sDateTimeEnd) && !empty($sDateTimeStart) ) {
	$aWhere[] = "(comment.created_at >= " . $sDateTimeStart . " AND comment.created_at <= " . $sDateTimeEnd . ")";
}


if ( isset($aVars['name']) && !empty($aVars['name']) ) {
	 $aWhere[] = "comment.created_by_id = " . $aVars['name'];
}

$aWhere[] = "comment.contact_id = " . $aVars['contact_id'];

if ( isset($aVars['name']) && !empty($aVars['branch_id']) ) {
	$aWhere[] = "branch.branch_id = " . $aVars['branch_id'];
}

if ( isset($aVars['comment_type_filter']) && !empty($aVars['comment_type_filter']) ) {
	$aWhere[] = "comment.comment_type_id = " . $aVars['comment_type_filter'];
}

$s = 
"SELECT TOP 10 comment.created_at, comment.comment, type.comment_type_name, (contact.first_name + ' ' + contact.last_name) as name FROM tms.dbo.contact_comments comment
	LEFT JOIN tms.dbo.tools_comment_types type ON type.comment_type_id = comment.comment_type_id
	LEFT JOIN tms.dbo.user_base ON user_base.user_id = comment.created_by_id
	LEFT JOIN tms.dbo.contact_base contact ON contact.contact_id = user_base.contact_id
	" . (!empty($aWhere) ? "WHERE " . implode($aWhere, " AND ") : '') . "
	ORDER BY comment.created_at DESC";

$res = $o->query($s);

//die($s);

$aReturn = array();
while ($row = $o->db->fetch_object($res) ) {
	if ( isset($row->created_at) && !empty($row->created_at) ) {
		$row->created_at = date('M d, Y H:i', strtotime($row->created_at) );
	}
	$aReturn[] = $row;
}
if ( empty($aReturn) ) 
	die();
echo json_encode($aReturn);

?>