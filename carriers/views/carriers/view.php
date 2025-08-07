<?php
if ( is_numeric($nId) && $nId > 0 ) {
    $nCarrierId = $nId;
}

$oCarrier = new CarrierBase();
$aCarrierData = $oCarrier->get_carrier_by_id($nCarrierId);
$aLocationDetails = $oCarrier->get_locations_by_carrier_id($nCarrierId);
?>
<div class="content-container">
	<div id="form-render"></div>
</div>
<div style="display: none;" id="carrier-general-information" class="sub-header-body no-padding">
		<table class="list" width="100%">
			<tbody>
				<tr>
					<th>
						Name
					</th>
					<th>
						SCAC
					</th>
					<th>
						MC-Num
					</th>
					<th>
						Status
					</th>
					<th>
						Safety Rating
					</th>
					<th>
						Safety Rating Date
					</th>
				</tr>
				<tr style="background-color: white !important;">
					<td><?php echo $aCarrierData->CarrName; ?></td>
					<td><?php echo $aCarrierData->CarrSCAC; ?></td>
					<td>MC-<?php echo $aCarrierData->mc_no; ?></td>
					<td><?php echo $aCarrierData->status_id == 1 ? 'Active' : 'NOT Active'; ?></td>
					<td><?php echo $aCarrierData->safety_rating; ?></td>
					<td><?php echo format_carrier_date( $aCarrierData->safety_rating_date ); ?></td>
				</tr>
			</tbody>
		</table>
	</div>

	<div id="location-information"></div>
	<div id="pay-to-information"></div>

</div>

	
<script type="text/javascript">
	Ext.require([
		'TMS.carrier.forms.Carrier'
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.carrier.forms.Carrier', {
			renderTo: 'form-render',
			carrier_id: '<?php echo $nCarrierId; ?>',
			record: Ext.decode('<?php echo json_encode($aCarrierData); ?>')
		});

	});
</script>

<?php 
/**
 * format the date into a '3-letter month' - 'day with leading zero', '4 number year'
 * @param sDate - string in the format yyyy-mm-dd
 * @return string in the format Mmm dd, yyyy
 */
function format_carrier_date( $sDate ){
	$sReturn = "";
	preg_match( '/([\d]{4})-([\d]{2})-([\d]{2})/', $sDate, $aMatches );
	return get_three_letter_month( $aMatches[2] ).' '.$aMatches[3].', '.$aMatches[1];
}