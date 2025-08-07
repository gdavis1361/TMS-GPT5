<?php
require_once 'config.php';

$file = __DIR__ . '/report/report.txt';

//Config
$doPaging = false;
$showTimers = true;
$showReports = true;
$page = intval(get('page', 0));
$perPage = 25;
$type = intval(get('type', '0'));

if (!$page && !$type) {
	$page = 1;
	$date = date('n/j/y g:ia');
	$str = "Starting migration at $date\n";
	@file_put_contents($file, $str);
}

$types = array(
	array(
		'name' => 'Contacts',
		'cls' => Migration_Actions::Contacts
	),
	
	array(
		'name' => 'Users',
		'cls' => Migration_Actions::Users
	),
	
	array(
		'name' => 'Locations',
		'cls' => Migration_Actions::Locations
	),
	
	array(
		'name' => 'Customers',
		'cls' => Migration_Actions::Customers
	),
	
	array(
		'name' => 'Payees',
		'cls' => Migration_Actions::Payees
	),
);


$numTypes = count($types);

if ($type >= $numTypes) {
	$date = date('n/j/y g:ia');
	$str = "Finished migration at $date\n";
	@file_put_contents($file, $str, FILE_APPEND);
	die('Finished');
}

$start = ($page-1) * $perPage;

LP_Timer::start("Migrating {$types[$type]['name']} starting at record $start (Page $page with $perPage per page)");

//Begin the migration
$migration = Migration::getInstance();

try {
	
	if ($type < $numTypes) {
		LP_Timer::start('Starting ' . $types[$type]['name']);
		
		if($doPaging){
			$numResults = $migration->migrate($types[$type]['cls'], $page, $perPage);
		}
		else{
			$numResults = $migration->migrate($types[$type]['cls'], false, false);
		}
		if (!$numResults) {
			$type++;
			$page = 0;
		}
		LP_Timer::stop();
	}
	else {
		die('Finished');
	}
	
	//$migration->migrate(Migration_Actions::Orders);
}
catch (Exception $e){
	pre($e->getMessage());
	info();
}

//Show the memory usage
$megaByte = 1048576;
$memoryUsage = memory_get_peak_usage(true) / $megaByte;
echo "Memory Usage: " . $memoryUsage . "MB<br />";

LP_Timer::stop();

//Show the timer messages
if($showTimers){
	$report = LP_Timer::showReport();
}

@file_put_contents($file, $report, FILE_APPEND);
echo '<pre>' . $report . '</pre>';

//Show the migration messages
if($showReports){
	$migration->showMessages();
}
?>

<script>
var url = '/sandbox/migration/index.php?type=<?php echo $type; ?>&page=<?php echo ($page+1); ?>';
//document.write('<a href="'+url+'">Next</a>');
//location.href = url;
</script>