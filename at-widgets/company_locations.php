<?php
require_once('../at-includes/engine.php');
require_once('../resources/functions.php');

$nContactType = request('contact_type', '');
$nId = request('id', 0);

if ($nContactType == 2) {
	$s = "
	SELECT
		location.*, info.City, info.State
	FROM
		tms.dbo.customer_to_location c2l
		LEFT JOIN tms.dbo.location_base location ON location.location_id = c2l.location_id
		LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON (info.Zip = location.zip AND info.Seq = location.seq)
	WHERE
		c2l.customer_id = '" . $nId . "'";

	$res = $oDB->query($s);

	$a = array();
	while ($row = $oDB->db->fetch_object($res)) {
		$a[] = $row;
	}
}
else if ($nContactType == 3) {

	$s = "
	SELECT
		location.*, info.City, info.State
	FROM 
		tms.dbo.location_to_carriers l2c
		LEFT JOIN tms.dbo.location_base location ON location.location_id = l2c.location_id
		LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON (info.Zip = location.zip AND info.Seq = location.seq)
	WHERE
		l2c.carrier_id = '" . $nId . "'";

	$res = $oDB->query($s);

	$a = array();
	while ($row = $oDB->db->fetch_object($res)) {
		$a[] = $row;
	}
}
else {
	die();
}
?>
<div class="location">
	<?php
	foreach ($a as $row) {
		?>
		<div location_id="<?php echo $row->location_id; ?>" class="info">
			<span class="location_name_1"><?php echo $row->location_name_1; ?></span>
				<? $row->location_name_2 = trim($row->location_name_2); ?>
				<?= !empty($row->location_name_2) ? "<br>\n<span class='location_name_2'>" . $row->location_name_2 . "</span>\n" : ''; ?><br/>
			<span class="address"><?= $row->address_1; ?>
				<? $row->address_2 = trim($row->address_2);
				$row->address_3 = trim($row->address_3); ?>
				<?= !empty($row->address_2) ? "<br/>" . $row->address_2 : ''; ?>
		<?= !empty($row->address_3) ? "<br/>" . $row->address_3 : ''; ?><br/>
		<?= $row->City . ", " . $row->State . " " . $row->zip; ?></span>
		</div>
	<?php
	}
	?>
	<div id="add_new" >
		<a href="#" style="position:absolute;"><img style="position: relative;top: 5px;" src="/resources/silk_icons/add.png">Add New</a>
	</div>
</div>


<script>
	$('#add_new a').click(function(){
		$.post('/at-widgets/company_add.php', { contact_type_id: '<?= $nContactType; ?>', id: '<?= $nId; ?>' }, function(d){
			$('#newLocDialog').html(d).dialog({
				modal: true, 
				width: 'auto', 
				height: 'auto',
				buttons: [{
						text: "Save",
						click: function() {
							$('#location_add').click();
							$('*').dialog("close");
						}
					}]
			});
		});
	});
	$('.location .info').click( function(){	
		var location_id = $(this).attr('location_id');
		var location_name = $(this).find('.location_name_1').html();
		var address = $(this).find('.address').html();
		var company_name = $(this).closest(".ui-dialog-content").dialog("option", "title")
		$(this).closest(".ui-dialog-content").dialog("close");
	
		$('#location_search_selected').html(
			'<div class="company-location-wrap">' + 
			'<table><tbody>' +
			'<tr class="company-selected-wrap"><td class="company-name-header">Company:</td><td><span id="company_name">' + company_name + '</span></td></tr>' +
			'<tr><td></td><td class="company-change-wrap"><span class="change">(<a href="#" id="location_search_again">Change Company</a>)</span></td></tr>' + 
			'<tr class="location-selected-wrap"><td class="location-name-header">Location:</td><td><span id="location_name">' + location_name + '</span><div>' + address + '</div></td></tr>' +
			'<tr><td></td><td><span class="change">(<a href="#" id="location_change">Change Location</a>)</span></td></tr>' + 
			'</tbody></table>' + 
			'</div>');
		$('#location_id').val(location_id);
		$('#location_search_stage').hide();
		$('#location_search_selected').show();
	});
</script>