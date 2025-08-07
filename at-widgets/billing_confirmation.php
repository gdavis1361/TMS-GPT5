<?
require_once('../at-includes/engine.php');
require_once('../resources/functions.php');

$nTaskId = request('task_id', 0);
$nCustomerId = request('cid', 0);

$oCustomer = new CustomerBase();
$oCustomer->load($nCustomerId);
$aLocations = $oCustomer->get_associated_locations($nCustomerId);
?>
<div>
	<form id="billing">
		<input type="hidden" name="task_id" value="<?=$nTaskId;?>">
		<input type="hidden" name="customer_id" value="<?=$nCustomerId;?>">
		<div class="customer">
			<h2> <?=$oCustomer->get('customer_name');?> </h2>
		<? foreach ($aLocations as $location):	?>
			<div class="location"><b><?=$location->location_name_1;?></b><br>
				<?=$location->address_1;?><br>
				<?=empty($location->address_2) ? $location->address_2 . "<br>" : "";?>
				<?=$location->City;?>, <?=$location->State . " " . $location->zip;?>
			</div>
		<? endforeach; ?>
		</div>
	</form>
</div>

<style>
#billing * {
	font-family: arial,sans-serif;
}

.location{
	border: 1px solid black;
	padding: 5px;
	margin: 10px;
	background-color: #cfcfcf;
}

</style>
