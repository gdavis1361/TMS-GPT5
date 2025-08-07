
<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
if ($oSession->session_var('role_id') !== 1) die(); // Admins Only!

$aVars = $_POST;

$o = new DBModel();
$o->connect();

$aVars = array_map(function ($value) { global $o; return empty($value) ? '' : $o->db->sql_escape($value); }, $aVars);

$aWhere = array();

if (!empty($aVars['name']) ) {
	$aVars['name'] = trim($aVars['name'], "'");
	$aWhere[] = "team.team_name LIKE '%" . $$aVars['name'] . "%'";
}
if (!empty($aVars['captain_name']) ) {
	$aVars['captain_name'] = trim($aVars['captain_name'], "'");
	if ( strpos($aVars['captain_name'], ' ') ) {
		list($first, $last) = explode(' ', $aVars['captain_name'], 2);
		if ( !empty($first) ) $aWhere[] = "contact.first_name LIKE '%" . $first . "%'";
		if ( !empty($last ) ) $aWhere[] = "contact.last_name LIKE '%"  . $last  . "%'";
	}else{
		$aWhere[] = "(contact.first_name LIKE '%" . $aVars['captain_name'] . "%' OR " .
					"contact.last_name LIKE '%" . $aVars['captain_name'] . "%')";
	}
}

$s = 
"SELECT team.league_team_id as team_id, team.team_name as name, (contact.first_name + ' ' + contact.last_name) as captain_name FROM tms.dbo.league_teams team
	LEFT JOIN tms.dbo.user_base ON user_base.user_id = team.captain_id
	LEFT JOIN tms.dbo.contact_base contact ON contact.contact_id = user_base.contact_id
	" . (!empty($aWhere) ? "WHERE " . implode($aWhere, " AND ") : '');

$res = $o->query($s);

$aReturn = array();
while ($row = $o->db->fetch_object($res) ) {
	$aReturn[] = $row;
}

echo json_encode($aReturn);

?>