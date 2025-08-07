<?php 
require_once SITE_ROOT . '/at-extend/GeoData.php';
//Load the preorder
$preOrderId = get('id', 0);
$preOrder = new PreOrderBase();
$preOrder->load($preOrderId);

//Load the customer
$customer = $preOrder->get_customer();
?>
<div class="quote-view">
	<div class="contentBox2">
	    <div class="header_text Delicious">Viewing Quote</div>
		<div class="contentBox2_body">
		
			<div class="quote-view-header Delicious">Customer Information</div>
			<div class="quote-view-item quote-view-customer">
				<table class="quote-view-table">
					<tbody>
						<tr>
							<td>
								<span class="label">Customer:</span>
							</td>
							<td>
								<?php echo $customer->get('customer_name'); ?>
							</td>
						</tr>
						<tr>
							<td>
								<span class="label">Bill Customer:</span>
							</td>
							<td>
								<?php
									$billToId = $preOrder->get_bill_to_id();
									if($billToId == $customer->get_customer_id()){
										echo "Yes";
									}
									else{
										echo "No";
									}
								?>
							</td>
						</tr>
						<tr>
							<td>
								<span class="label">Ordered By:</span>
							</td>
							<td>
								<?php
									$orderedById = $preOrder->get_ordered_by_id(); 
									if(intval($orderedById)){
										$orderedByContact = new ContactBase();
										$orderedByContact->load($orderedById);
										echo $orderedByContact->get_first_name() . " " . $orderedByContact->get_last_name();
									}
								?>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			
			<div class="quote-view-header Delicious">Modes</div>
			<div class="quote-view-item quote-view-modes">
				<?php 
					$modes = $preOrder->list_modes();
					if(count($modes)){
						foreach ($modes as $mode){
							echo "<div class=\"list-item\">{$mode->mode_name}</div>";
						}
					}
					else{
						echo "<div class=\"list-item\">No modes were specified...</div>";
					}
				?>
			</div>
			
			<div class="quote-view-header Delicious">Equipment</div>
			<div class="quote-view-item quote-view-equipment">
				<?php 
					$equipment = $preOrder->list_equipment();
					if(count($equipment)){
						foreach ($equipment as $equipmentRow){
							echo "<div class=\"list-item\">{$equipmentRow->name}</div>";
						}
					}
					else{
						echo "<div class=\"list-item\">No equipment types were specified...</div>";
					}
				?>
			</div>
			
			<div class="quote-view-header Delicious">Details</div>
			<div class="quote-view-item quote-view-details">
				<?php 
					$details = $preOrder->list_details();
					if(count($details)){
						$detailHtml = '<table class="quote-view-table"><tbody>';
						foreach ($details as $detail){
							$detailHtml .= "<tr>
												<td>
													<span class=\"label\">$detail->name:</span>
												</td>
												<td>
													$detail->detail_value
												</td>
											</tr>";
						}
						$detailHtml .= "</tbody></table>";
					}
					else{
						$detailHtml = "<div class=\"list-item\">No details were specified...</div>";
					}
					echo $detailHtml;
				?>
			</div>
			
			<div class="quote-view-header Delicious">Stops</div>
			<div class="quote-view-item quote-view-stops">
				<?php 
				$db = new DBModel();
				$db->connect();
				$query = "SELECT * FROM pre_order_stops pos
							LEFT JOIN pre_order_stop_to_location posl
							ON pos.pre_order_stops_id = posl.pre_order_stops_id
							WHERE pos.pre_order_id = '$preOrderId'
							ORDER BY pos.stop_index ASC";
				$result = $db->query($query);
				for ($i = 0; $row = $db->db->fetch_assoc($result); $i++){
					$geoData = new GeoData();
					$address = '';
					if(intval($row['location_id'])){
						//Get the location
						$locationBase = new LocationBase();
						$locationBase->load($row['location_id']);
						$geoData = new GeoData();
						$zipRow = $geoData->lookup_zip($locationBase->get('zip'));
						$address = ucfirst(strtolower($zipRow->City)) . ", " . $zipRow->State . " (" . $zipRow->Zip . ")" . "<br />" . $locationBase->get('location_name_1') . " " . $locationBase->get('location_name_2') . "(" . $locationBase->get('address_1') . " " . $locationBase->get('address_2') . ")";
					}
					else{
						//Get the location data by zip
						$zipRow = $geoData->lookup_zip($row['zip_code']);
						$address = ucfirst(strtolower($zipRow->City)) . ", " . $zipRow->State . " (" . $zipRow->Zip . ")";
					}
					
					//Echo the address
					$count = $i+1;
					echo "<div class=\"list-item\">
							<div style=\"float: left; display: inline; padding-right: 5px;\">
								<span class=\"label\">$count.</span>
							</div>
							<div style=\"float: left; display: inline;\">
								$address
							</div>
							<div style=\"clear: both; line-height: 1px; \"></div>
						</div>";
				}
				?>
			</div>
			
			<div class="quote-view-header Delicious">Charges</div>
			<div class="quote-view-item quote-view-charges">
				<?php 
					$preOrderCharge = $preOrder->get_charge();
				?>
				<table class="quote-view-table">
					<tbody>
						<tr>
							<td>
								<span class="label">Linehaul Charge:</span>
							</td>
							<td>
								<?php echo $preOrderCharge->get('linehaul_charge'); ?>
							</td>
						</tr>
						<tr>
							<td>
								<span class="label">Accessorial Charge:</span>
							</td>
							<td>
								<?php echo $preOrderCharge->get('accessorial_charge'); ?>
							</td>
						</tr>
						<tr>
							<td>
								<span class="label">Fuel Charge:</span>
							</td>
							<td>
								<?php echo $preOrderCharge->get('fuel_charge'); ?>
							</td>
						</tr>
						<tr>
							<td>
								<span class="label">Total:</span>
							</td>
							<td>
								<?php echo $preOrderCharge->get('total_charge'); ?>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			
			<div class="quote-view-header Delicious">Comments</div>
			<div class="quote-view-item quote-view-comments">
				<?php 
					$comments = $preOrder->list_comments();
					if(count($comments)){
						foreach ($comments as $comment){
							echo "<div class=\"list-item\">{$comment->get('comment')}</div>";
						}
					}
					else{
						echo "<div class=\"list-item\">No equipment types were specified...</div>";
					}
				?>
			</div>
			
		</div>
	</div>
	
</div>