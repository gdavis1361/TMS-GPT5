<html>
	<head>
		<title><?php echo $this->title; ?></title>
		<link rel="stylesheet" type="text/css" href="../../templates/orders/confirmation.css" />
	</head>
	<body>
		<table id="header" cellspacing="0" cellpadding="0">
			<tbody>
				<tr>
					<td class="column left strong">
						Access America Transport<br />2515 East 43rd St, Suite B<br />Chattanooga, TN 37407
					</td>
					<td class="column center" id="pageLogo">
						<img src="../../resources/access_america_logo.jpg" />
					</td>
					<td class="column right strong">
						<p>
							Page 1
						</p>
						<p>
							<?php echo $this->date; ?>
						</p>
					</td>
				</tr>
				<tr>
					<td class="left strong">
						www.accessamericatransport.com
					</td>
					<td class="center documentTitle strong">
						<h1><?php echo $this->documentTitle; ?></h1>
					</td>
					<td class="right strong">
						<h1><?php echo $this->documentSubtitle; ?></h1>
					</td>
				</tr>
			</tbody>
		</table>
		
		<table class="dataTable">
			<tbody>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<tr>
					<td class="cell1"></td>
					<td class="cell2"></td>
					<td class="cell3"></td>
					<td class="cell4"></td>
					<td class="cell5"></td>
					<td class="cell6"></td>
					<td class="cell7"></td>
				</tr>
				<tr>
					<td class="strong">
						Carrier:
					</td>
					<td colspan="2">
						<?php echo $this->carrierName; ?>
					</td>
					<td colspan="2">
						<?php
						if (strlen($this->mcNumber)) {
							?>
							<strong>MC:</strong> <?php echo $this->mcNumber; ?>
							<?php
						}
						?>
					</td>
					<td class="strong">
						<?php
						if (strlen($this->carrierContactName)) {
							?>
							Contact:
							<?php
						}
						?>
					</td>
					<td>
						<?php
						echo $this->carrierContactName;
						if (strlen($this->carrierContactPhone)) {
							echo ' (' . $this->carrierContactPhone . ')';
						}
						?>
					</td>
				</tr>
				<tr>
					<td></td>
					<td colspan="4">
						<?php echo $this->carrierAddress; ?>
					</td>
					<td class="strong">
						<?php
						if (strlen($this->trailerType)) {
							?>
							Trailer Type:
							<?php
						}
						?>
					</td>
					<td>
						<?php echo $this->trailerType; ?>
					</td>
				</tr>
				
				<?php
				/*
				<tr>
					<td class="strong">
						<?php
						if (strlen($this->commodity)) {
							?>
							Commodity:
							<?php
						}
						?>
					</td>
					<td>
						<?php echo $this->commodity; ?>
					</td>
				</tr>
				<tr>
					<td colspan="5"></td>
					<td class="strong">
						<?php
						if (floatval($this->weight) > 0) {
							?>
							Weight:
							<?php
						}
						?>
					</td>
					<td>
						<?php
						if (floatval($this->weight) > 0) {
							echo $this->weight . ' lbs';
						}
						?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td class="strong">
						<?php
						if (strlen($this->temp)) {
							?>
							Temp:
							<?php
						}
						?>
					</td>
					<td colspan="2">
						<?php echo $this->temp; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td class="strong">
						<?php
						if (strlen($this->reference)) {
							?>
							Reference:
							<?php
						}
						?>
					</td>
					<td>
						<?php echo $this->reference; ?>
					</td>
				</tr>
				*/
				?>
				
				<?php
				$stops = $this->stops;
				if (is_array($stops)) {
					for ($i = 0; $i < count($stops); $i++) {
						$stop = $stops[$i];
						?>
						<tr>
							<td></td>
							<td colspan="6" class="divider"></td>
						</tr>
						<tr>
							<td></td>
							<td class="strong">
								<?php echo $stop['stopTypeDisplay']; ?>
							</td>
							<td>
								Name:
							</td>
							<td colspan="2">
								<?php echo $stop['location_name_1']; ?>
							</td>
							<td>
								Date:
							</td>
							<td>
								<?php
								echo $stop['dateDisplay'];
								?>
							</td>
						</tr>
						<tr>
							<td colspan="2"></td>
							<td>
								Address:
							</td>
							<td colspan="2">
								<?php
								echo $stop['address_1'];
								?>
							</td>
							<td>
								<?php
								if (strlen($stop['first_name'])) {
									?>
									Contact:
									<?php
								}
								?>
							</td>
							<td>
								<?php
								echo $stop['first_name'] . ' ' . $stop['last_name'];
								if (strlen($stop['phone'])) {
									echo ' (' . $stop['phone'] . ')';
								}
								?>
							</td>
						</tr>
						<tr>
							<td colspan="3"></td>
							<td colspan="2">
								<?php echo $stop['address_2']; ?>
							</td>
						</tr>
						<tr>
							<td colspan="4"></td>
							<td>
								<?php
								if (strlen($stop['driver_load'])) {
									?>
									Driver Load:
									<?php
								}
								?>
							</td>
							<td>
								<?php echo $stop['driver_load']; ?>
							</td>
						</tr>
						
						<?php
						// check for stop details
						if (isset($this->stopDetails[$stop['stop_index']])) {
							$stopDetails = $this->stopDetails[$stop['stop_index']];
							?>
							<tr>
								<td colspan="2"></td>
								<td colspan="5">
									<strong>Details:</strong>
									<p>
										<?php
										for ($j = 0; $j < count($stopDetails); $j++) {
											echo '<strong>' . $stopDetails[$j]['detail_type_name'] . ':</strong> ' . $stopDetails[$j]['detail_value'] . '. ';
										}
										?>
									</p>
								</td>
							</tr>
							<?php
						}
					}
				}
				?>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<tr>
					<td colspan="2" class="strong">
						Payment
					</td>
					<td class="strong">
						Carrier Freight Pay:
					</td>
					<td class="right">
						$<?php echo number_format($this->carrierFreightPay, 2); ?>
					</td>
					<td colspan="3"></td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td class="strong">
						<?php
						if ($this->fuelPay > 0) {
							?>
							Fuel Pay:
							<?php
						}
						?>
					</td>
					<td class="right">
						<?php
						if ($this->fuelPay > 0) {
							echo '$' . number_format($this->fuelPay, 2);
						}
						?>
					</td>
					<td colspan="3"></td>
				</tr>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<?php
				if (count($this->instructions)) {
					?>
					<tr>
						<td colspan="7" class="strong">
							Instructions
							<ul>
								<?php
								for ($j = 0; $j < count($this->instructions); $j++) {
									?>
									<li>
										<?php echo $this->instructions[$j]; ?>
									</li>
									<?php
								}
								?>
							</ul>
						</td>
					</tr>
				
					<tr>
						<td colspan="7" class="divider"></td>
					</tr>
				<?php
				}
				
				if (count($this->details)) {
					?>
					<tr>
						<td colspan="7">
							<strong>Load Details:</strong>
							<ul>
								<?php
								for ($j = 0; $j < count($this->details); $j++) {
									?>
									<li>
										<?php
										echo '<strong>' . $this->details[$j]['detail_type_name'] . ':</strong> ' . $this->details[$j]['detail_value'];
										?>
									</li>
									<?php
								}
								?>
							</ul>
						</td>
					</tr>
				
					<tr>
						<td colspan="7" class="divider"></td>
					</tr>
				<?php
				}
				?>
				
				<tr>
					<td colspan="2" class="strong">
						Agreement
					</td>
					<td colspan="3" class="strong">
						To confirm agreed upon rate on the shipment above,
						please sign and fax back to:
					</td>
					<td></td>
					<td>
						<?php echo $this->brokerName; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td colspan="3" class="strong">
						
					</td>
					<td class="strong">
						<?php
						if (strlen($this->brokerPhone)) {
							?>
							Phone:
							<?php
						}
						?>
					</td>
					<td class="strong">
						<?php echo $this->brokerPhone; ?>
					</td>
				</tr>
				<tr>
					<td colspan="5"></td>
					<td class="strong">
						<?php
						if (strlen($this->brokerFax)) {
							?>
							Fax:
							<?php
						}
						?>
					</td>
					<td class="strong">
						<?php echo $this->brokerFax; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td colspan="3" class="divider signature-line"></td>
					<td colspan="2"></td>
				</tr>
			</tbody>
		</table>
		
		<h2>Dispatch Instructions</h2>
		<ul>
			<li>Driver must have signed documentation and then call for approval if any loading or unloading is required.</li>
			<li class="strong">POD with AAT load number must be faxed or emailed within 24 hours of delivery to: 1-866-748-4092 or pod@accessamericatransport.com.</li>
			<li>No double brokering allowed.</li>
			<li>Detention will be paid ONLY if this office is notified during the occurrence and times are clearly marked on BOL's.</li>
			<li>Late or missed pickup/delivery without prior notification may result in a fine up to $400.00.</li>
		</ul>
		
		<h2>Payment Procedures</h2>
		<p>
			Payment of freight charges requires each of the following:
		</p>
		<ul>
			<li class="strong">
				Signed original BOL, AAT load confirmation, and carrier invoice must be sent to:<br />
				Access America Transport, Carrier Payables, PO Box 182215, Chattanooga, TN 37422
			</li>
			<li>Certificates of insurance (auto liability, cargo, and worker's comp).</li>
			<li>Contract carrier authority, signed AAT carrier-broker agreement, and W-9 information.</li>
		</ul>
		
		<table class="dataTable">
			<tbody>
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
			</tbody>
		</table>
	</body>
</html>