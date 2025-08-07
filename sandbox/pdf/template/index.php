<html>
	<head>
		<title><?php echo $this->title; ?></title>
		<link rel="stylesheet" type="text/css" href="template/index.css" />
	</head>
	<body>
		<table id="header" cellspacing="0" cellpadding="0">
			<tbody>
				<tr>
					<td class="column left">
						<?php echo $this->address; ?>
					</td>
					<td class="column center">
						<img src="<?php echo $this->logo; ?>" />
					</td>
					<td class="column right">
						Page <?php echo $this->pageNumber; ?>
					</td>
				</tr>
				<tr>
					<td class="left">
						<?php echo $this->websiteUrl; ?>
					</td>
					<td class="center documentTitle">
						<?php echo $this->documentTitle; ?>
					</td>
					<td class="right">
						<?php echo $this->documentSubtitle; ?>
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
					<td>one</td>
					<td>two</td>
					<td>three</td>
					<td>four</td>
					<td>five</td>
					<td>six</td>
					<td>seven</td>
				</tr>
				<tr>
					<td class="strong">
						Carrier:
					</td>
					<td colspan="5">
						<?php echo $this->carrier; ?>
					</td>
					<td class="strong">
						Contact:
					</td>
					<td>
						<?php echo $this->carrierContactName; ?>
					</td>
				</tr>
				<tr>
					<td></td>
					<td colspan="5">
						<?php echo $this->carrierAddress; ?>
					</td>
					<td class="strong">
						Phone:
					</td>
					<td>
						<?php echo $this->carrierContactPhone; ?>
					</td>
				</tr>
				<tr>
					<td class="strong">
						Date:
					</td>
					<td colspan="5">
						<?php echo $this->date; ?>
					</td>
					<td class="strong">
						Fax:
					</td>
					<td>
						<?php echo $this->carrierContactFax; ?>
					</td>
				</tr>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<tr>
					<td colspan="2" class="strong">
						Load
					</td>
					<td class="strong">
						Load:
					</td>
					<td colspan="2">
						<?php echo $this->loadNumber; ?>
					</td>
					<td class="strong">
						Commodity:
					</td>
					<td>
						<?php echo $this->commodity; ?>
					</td>
				</tr>
				<tr>
					<td colspan="5"></td>
					<td class="strong">
						Weight:
					</td>
					<td>
						<?php echo $this->weight; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td class="strong">
						Temp:
					</td>
					<td colspan="2">
						<?php echo $this->temp; ?>
					</td>
					<td class="strong">
						Trailer Type:
					</td>
					<td>
						<?php echo $this->trailerType; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td class="strong">
						BOL #:
					</td>
					<td colspan="2">
						<?php echo $this->bol; ?>
					</td>
					<td class="strong">
						Reference:
					</td>
					<td>
						<?php echo $this->reference; ?>
					</td>
				</tr>
				
				<tr>
					<td></td>
					<td colspan="6" class="divider"></td>
				</tr>
				
				<tr>
					<td colspan="7">dynamic sections</td>
				</tr>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<tr>
					<td colspan="2" class="strong">
						Payment
					</td>
					<td colspan="2" class="strong">
						Carrier Freight Pay:
					</td>
					<td class="right">
						$<?php echo number_format($this->carrierFreightPay, 2); ?>
					</td>
					<td colspan="2"></td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td colspan="2" class="strong">
						Fuel Pay:
					</td>
					<td class="right">
						<?php echo number_format($this->fuelPay, 2); ?>
					</td>
					<td colspan="2"></td>
				</tr>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<tr>
					<td colspan="7" class="strong">
						Instructions
						<p>
							<?php echo $this->instructions; ?>
						</p>
					</td>
				</tr>
				
				<tr>
					<td colspan="7" class="divider"></td>
				</tr>
				
				<tr>
					<td colspan="2" class="strong">
						Agreement
					</td>
					<td colspan="3" class="strong">
						To confirm agreed upon rate on the shipment above,
					</td>
					<td></td>
					<td>
						<?php echo $this->brokerName; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td colspan="3" class="strong">
						please sign and fax back to:
					</td>
					<td class="strong">
						Phone:
					</td>
					<td class="strong">
						<?php echo $this->brokerPhone; ?>
					</td>
				</tr>
				<tr>
					<td colspan="5"></td>
					<td class="strong">
						Fax:
					</td>
					<td class="strong">
						<?php echo $this->brokerFax; ?>
					</td>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td colspan="3" class="divider"></td>
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