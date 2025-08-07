<?php
include $_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php';
include $_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php';
?>
<!DOCTYPE html> 
<html> 
<head>
<title>Access America Transport</title>
<script src="/resources/js/extjs/ext-all.js"></script>
<link rel="stylesheet" type="text/css" href="/resources/js/extjs/resources/css/ext-all.css" />
</head>
<body>
<?php
$config = array(
	'host' => '184.106.79.198',
	'dbname' => 'TMS',
	'username' => 'tmsuser',
	'password' => 'pRCseCGRE4pV3pGdJ4cBcUSF'
);
$db = Zend_Db::factory('Sqlsrv', $config);

$select = new Zend_Db_Select($db);
$select->from(array('stats' => 'league_stats'), array('points' => 'stats.points'))
		->joinLeft(array('date' => 'league_dates'), 'dates.date_id = stats.date_id', array('year' => 'YEAR(dates.league_date)', 'month' => 'MONTH(dates.league_date)', 'dates.league_date'))
		->where("stats.user_id = 2")
		->where("dates.league_date BETWEEN '05/30/2011' AND '06/08/2011'")
		->group('YEAR(dates.league_date)')
		->group('MONTH(dates.league_date)')
		->order("dates.league_date ASC");

echo $select->assemble();
die();

/*
 * SELECT
 *	stats.points points, 
 *	YEAR(dates.league_date) year, 
 *	MONTH(dates.league_date) month, 
 *	dates.league_date 
 * FROM 
 *	league_stats stats 
 *LEFT JOIN 
 *	league_dates dates ON dates.date_id = stats.date_id 
 * WHERE 1=1 
 * AND stats.user_id = '2' 
 * AND dates.league_date BETWEEN '04/08/2011' AND '06/08/2011' 
 * GROUP BY 
 *	YEAR(dates.league_date), 
 *	MONTH(dates.league_date) 
 * ORDER BY dates.league_date ASC
 */

$select = $db->select()
		->from('contact_base', '*', 'dbo')
		->limitPage(5, 10);

$query = $select->assemble();
echo $query;
die();
$result = $oDB->query($query);
query_info();
pre($result);

?>
</body>
</html>