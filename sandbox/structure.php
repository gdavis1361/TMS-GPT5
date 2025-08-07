<?php
$sSection = 'my page';
$sPage    = 'my stats';
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');
$vDisplayRenderTime = true;

$a = $oSession->session_var( 'pod_structure' );

$aUserIds = array();
foreach($a as $depth => $a2) {
	foreach($a2 as $a3) {
		foreach($a3 as $user) {
			$aUserIds[] = $user['user_id'];
		}
	}
}

$nDate = 3;

$oDb = new LeagueStats();
$oDb->where('user_id', '=', $aUserIds);
$oDb->where('date_id', '=', $nDate);

$aTmpRows = $oDb->list()->rows;
$aRows = array();


foreach($aTmpRows as $row) {
	$aRows[$row->get('user_id')] = $row->get();
}

?>
<div class="contentBox2">
	<div class="contentBox2_body">
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr><th>User Id</t>
					<th>Name</th>
					<th>Team</th>
					<th>Total Margin</th>
					<th>Commission Level</th>
					<th>Commission Matched</th>
					<th>Amount matched to Steve Cox</th>
				</tr>
			</thead>

			<tbody>
				<?
				$nTotal = 0;
				$nUserCount = 0;
				foreach($a as $depth => $a2) {
					?><tr><td colspan='7' style="text-align: center"><b>Depth: <?=$depth;?></b></td></tr><?
					foreach($a2 as $a3) {
						foreach($a3 as $user) {
							$nUserCount++;
							$margin = (isset($aRows[$user['user_id']]) ? $aRows[$user['user_id']]['margin'] : 0);
							$aComm = get_commission_rate($margin, $user['comm_pct']);
							$nTotal += $aComm['commission'];
							?>
							<tr><td><?=$user['user_id'];?></td>
								<td><?=$user['name'];?></td>
								<td><?=$user['is_captain'] ? "<b>Captain</b> " : "";?><?=$user['team_name'];?></td>
								<td>$<?=round($margin, 2);?></td>
								<td><?=$aComm['comm_pct'] * 100;?>%</td>
								<td><?=$user['comm_pct'] * 100;?>%</td>
								<td>$<?=$aComm['commission'];?></td>
							</tr><?
						}
					}
				}
				?>
				<td colspan="6" style="text-align: right;"><b>Total:<b></td>
				<td>$<?=$nTotal;?></td>
			</tbody>

		</table>

	</div>
</div>

<div style="display:none"> <?=info();?> <br>
	<?=$nUserCount;?> Total Users Displayed
</div>
<div style="background: #fff;">
<?
info();
echo "</div>";
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');
?>