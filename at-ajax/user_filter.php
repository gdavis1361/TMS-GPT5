<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$aVars = $_POST;

$sDateStart = !empty($aVars['date_start']) ? date('Y-m-d', strtotime($aVars['date_start']) ) : '';
$sTimeStart = !empty($aVars['time_start']) ? date('H:i:s', strtotime($aVars['time_start']) ) : '';

$sDateEnd = !empty($aVars['date_end']) ? date('Y-m-d', strtotime($aVars['date_end']) ) : '';
$sTimeEnd = !empty($aVars['time_end']) ? date('H:i:s', strtotime($aVars['time_end']) ) : '';

if ( empty($sDateStart) && empty($sTimeStart) ) {
	$sDateTimeStart = '';
} else if ( empty($sDateStart) ) {
	$sDateTimeStart = date('Y-m-d') . " " . $sTimeStart;
} else if ( empty($sTimeStart) ) {
	$sDateTimeStart = $sDateStart . ' 00:00:00.000';
}else{
	$sDateTimeStart = $sDateStart . ' ' . $sTimeStart;
}
if ( empty($sDateEnd) && empty($sTimeEnd) ) {
	$sDateTimeEnd = '';
} else if ( empty($sDateEnd) ) {
	$sDateTimeEnd = date('Y-m-d') . " " . $sTimeEnd;
} else if ( empty($sTimeEnd) ) {
	$sDateTimeEnd = $sDateEnd . ' 23:59:59.999';
}else{
	$sDateTimeEnd = $sDateEnd . ' ' . $sTimeEnd;
}

if ( empty($sDateTimeStart) ) {
	$sDateOperator = '<=';
} else if ( empty($sDateTimeEnd) ) {
	$sDateOperator = '>=';
}

$o = new DBModel();
$o->connect();

$aVars = array_map(function ($value) { global $o; return empty($value) ? '' : $o->db->sql_escape($value); }, $aVars);
$sDateTimeEnd = !empty($sDateTimeEnd) ? $o->db->sql_escape($sDateTimeEnd) : '';
$sDateTimeStart = !empty($sDateTimeStart) ? $o->db->sql_escape($sDateTimeStart) : '';

$aWhere = array();

if ( isset($sDateOperator) && (!empty($sDateTimeStart) || !empty($sDateTimeEnd) ) ) {
	$aWhere[] = "emp.hire_date " . $sDateOperator . " " . (empty($sDateTimeStart) ? $sDateTimeEnd : $sDateTimeStart);
}else if ( !empty($sDateTimeEnd) && !empty($sDateTimeStart) ) {
	$aWhere[] = "(emp.hire_date >= " . $sDateTimeStart . " AND emp.hire_date <= " . $sDateTimeEnd . ")";
}

if ( isset($aVars['user_role']) && !empty($aVars['user_role']) ) { 
	$aWhere[] = ' role.role_id = ' . $aVars['user_role'];
}

if ( isset($aVars['name']) && !empty($aVars['name']) ) {
	$aVars['name'] = trim($aVars['name'], "'");
	if ( strpos($aVars['name'], ' ') ) {
		list($first, $last) = explode(' ', $aVars['name'], 2);
		if ( !empty($first) ) $aWhere[] = "contact.first_name LIKE '%" . $first . "%'";
		if ( !empty($last ) ) $aWhere[] = "contact.last_name LIKE '%"  . $last  . "%'";
	}else{
		$aWhere[] = "(contact.first_name LIKE '%" . $aVars['name'] . "%' OR " .
					"contact.last_name LIKE '%" . $aVars['name'] . "%')";
	}
}

if ( isset($aVars['name']) && !empty($aVars['branch_id']) ) {
	$aWhere[] = "branch.branch_id = " . $aVars['branch_id'];
}

$s = 
"SELECT user_base.user_id, (contact.first_name + ' ' + contact.last_name) as name, branch.branch_name, role.role_name FROM tms.dbo.user_base
	LEFT JOIN tms.dbo.user_roles role ON role.role_id = user_base.role_id
	LEFT JOIN tms.dbo.user_employees emp ON emp.user_id = user_base.user_id
	LEFT JOIN tms.dbo.contact_base contact ON user_base.contact_id = contact.contact_id
	LEFT JOIN tms.dbo.user_employee_to_branch branch_rel ON branch_rel.user_id = user_base.user_id
	LEFT JOIN tms.dbo.user_branches branch ON branch_rel.branch_id = branch.branch_id
	" . (!empty($aWhere) ? "WHERE " . implode($aWhere, " AND ") : '');

$res = $o->query($s);

$aReturn = array();
while ($row = $o->db->fetch_object($res) ) {
	if ( isset($row->hire_date) && !empty($row->hire_date) ) {
		$row->hire_date = date('M d, Y', strtotime($row->hire_date) );
	}
	$aReturn[] = $row;
}
if ( empty($aReturn) ) 
	die();
echo json_encode($aReturn);

?>