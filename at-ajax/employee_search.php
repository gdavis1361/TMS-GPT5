<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$sName = request('term');

$o = new DBModel();
$o->connect();

$sName = empty($sName) ? $sName : $o->db->sql_escape($sName);

$sWhere = '';
if (!empty($sName) ) {
	$sName = trim($sName, "'"); //remove the quotes from the sql_escape
	if ( strpos($sName, ' ') ) {
		list($first, $last) = explode(' ', $sName, 2);
		if ( !empty($first) ) $sWhere .= " AND contact.first_name LIKE '%" . $first . "%'\n\t";
		if ( !empty($last ) ) $sWhere .= " AND contact.last_name LIKE '%"  . $last  . "%'";
	}else{
		$sWhere = " AND (contact.first_name LIKE '%" . $sName . "%' OR " .
					"contact.last_name LIKE '%" . $sName . "%')";
	}
}

$s = 
"SELECT team.team_id, user_pods.pod_id, user_base.user_id, (contact.first_name + ' ' + contact.last_name) as label FROM user_pods 
	LEFT JOIN tms.dbo.user_employees emp ON user_pods.pod_captain_id = emp.user_id
	LEFT JOIN tms.dbo.user_employee_to_pod pod ON pod.user_id = emp.user_id
	LEFT JOIN tms.dbo.user_employee_to_team team ON team.user_id = emp.user_id
	LEFT JOIN tms.dbo.user_base ON emp.user_id = user_base.user_id
	LEFT JOIN tms.dbo.contact_base contact ON user_base.contact_id = contact.contact_id
	WHERE team.active = '1' 
	" . (!empty($sWhere) ? $sWhere : '');

$res = $o->query($s);

$aReturn = array();
while ($row = $o->db->fetch_object($res) ) {
	
	$aReturn[] = $row;
}
	
echo json_encode($aReturn);

?>