<div class="contentBox2" ><div class="header_text Delicious">
  <?php if(!empty($newLoadDetailsHeader)) echo $newLoadDetailsHeader; ?>
</div>
   
<div class="contentBox2_body" style="padding-left: 15px;">
<?php 

if(!empty($newLoadDetails))
{
	echo $newLoadDetails;
}
?>

</div>
</div>

<div class="contentBox2"><div class="header_text Delicious">Loads</div>
	<div class="contentBox2_body">
	
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr ><th width="75px">Customer</th>
					<th>Origin</th>
					<th>Destination</th>
					<th>Equipment</th>
                    <th align="center" width="120px">Carrier</th>
					<th width="65px">Edit</th>
				</tr>
            </thead>
			<tbody>
		<?

		$oLoads = new LoadBase();
		$aLoads = $oLoads->list();
        $oOrder = new OrderBase();
		$oGeoData = new GeoData();
        $oCarrier = new CarrierBase();
        
		foreach ($aLoads->rows as $Load) {
        
            $nLoadId = $Load->get_load_id();
            $nOrderId = $Load->get_order_id();
			$oLoads->load($nLoadId);
            $oOrder->load($nOrderId);
			$oCustomer = $oOrder->get_customer();
            $aStops = $oOrder->get_stops();
            $oDestination = array_pop($aStops);
            $oOrigin = array_shift($aStops);
            $Origin  = lookup_zip($oOrigin->get('location_id'));
            $Destination = lookup_zip($oDestination->get('location_id'));
            $oOriginGeo = $oGeoData->lookup_zip($Origin);
            $sOrigin = $oOriginGeo->City . ", " . $oOriginGeo->State . " (" . $Origin . ")";
            $oDestinationGeo = $oGeoData->lookup_zip($Destination);
            $sDestination = $oDestinationGeo->City . ", " . $oDestinationGeo->State . " (" . $Destination . ")";
            $aCarrier = $oCarrier->get_carrier_by_id($Load->get_carrier_id());
            // todo : fix
            @$sCarrier = $aCarrier->CarrName;
            
               
			$aEquipment = $oOrder->list_equipment();
			$aEquipmentNames = array();
			foreach ($aEquipment as $equip) {
				$aEquipmentNames[] = $equip->name;
			}
			?>
			<tr><td><?=$oCustomer->get_customer_name();?></td>
				<td><?=$sOrigin;?></td>
				<td><?=$sDestination;?></td>
				<td><?=implode(", ", $aEquipmentNames);?></td>
                <td align="center"><?=$sCarrier;?></td>
				<td><a href="?d=loads&amp;a=show&amp;id=<?=$nOrderId;?>"><img src="/resources/silk_icons/page_edit.png" alt="Edit" title="Edit" /> Edit</a></td>
			</tr>
			<?
        }   
        function lookup_zip($nLocId) {
            $oLocationBase = new LocationBase();
            $oLocationBase->where('location_id', '=', $nLocId);
            $aLocationBase = $oLocationBase->list();
            foreach( $aLocationBase->rows as $Location ) {
                return $a = $Location->zip;
            }
        }
        ?>
			</tbody>
		</table>
	</div>
</div>