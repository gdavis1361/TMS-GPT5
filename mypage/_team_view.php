


<div class="contentBox2" id="leftNav">
	<div class="contentBox2_body">
		<?
		$nUserId = request('user', get_user_id() );

		$oUserBase = new UserBase();
		$oUserBase->load($nUserId);

		$img = $oUserBase->get('image');
		if ( empty($img) ) $img = 'noimage.png';
		?>
		<center>
			<h3 style="margin-top: 0px"><?=$oUserBase->get_Contact()->get_FirstLastName();?></h3>
			<img src="/resources/<?=$img;?>" width="130px" style="border: 1px solid black">
		</center>
	</div>
</div>
<div id="MyPageLeftContainer">
	<div class="contentBox2" id="myPage"><div class="header_text Delicious">Team Stats</div><div class="contentBox2_body">

		<?

			$oLeagueStats = new LeagueStats();
			$vLoaded = $oLeagueStats->load_by_user($nUserId);

			if ($vLoaded) {
				$nAverage 		= $oLeagueStats->get_Call_Interval_Avg();
				$nContactCount 	= $oLeagueStats->get_total_Contacts();
				$nUpToDate 		= $oLeagueStats->get_up_to_date_Contacts();
				$nUpToDatePct 	= $oLeagueStats->get_Up_To_Date_Pct();
			}else{
		?>
			<span class="invalid_label">No record found for this user ID.</span>
		<?	} ?>
		<table id="MyStatsTable" width="100%" cellspacing="0px" cellpadding="5px">
			<tr>
				<th>Statistics</th>
				<th width="80px">Value</th>
				<th width="80px">Rank</th>
				<th width="80px">Goal</th>
			</tr>
			<tr>
				<td>Total Contacts</td>
				<td><?=$vLoaded ? $nContactCount : '-';?></td>
				<td>&nbsp;</td>
				<td>&nbsp;</td>
			</tr>
			<tr>
				<td>Average Call Interval</td>
				<td><?=$vLoaded ? $nAverage : '-';?> days</td>
				<td>&nbsp;</td>
				<td>&nbsp;</td>
			</tr>
			<tr>
				<td>Up To Date Contacts</td>
				<td><?=$vLoaded ? $nUpToDate : '-';?></td>
				<td>&nbsp;</td>
				<td>&nbsp;</td>
			</tr>
			<tr>
				<td>Up To Date Contacts (%)</td>
				<td><?=$vLoaded ? ($nUpToDatePct * 100) : '-';?>%</td>
				<td>&nbsp;</td>
				<td>&nbsp;</td>
			</tr>
		</table>
	</div></div>
	<div class="contentBox2" id="myPageAchievements"><div class="header_text Delicious">Awards & Achievements</div>
		<div class="contentBox2_body"><center>
			<?
			$aImages = array( '../resources/img/thumb_icon.png', '../resources/img/medal_icon.jpg', '../resources/img/podium_icon.png');
			$aNames = array( 'People Person', 'Phone Freak', 'Numero Uno' );
			$aDesc = array( '40 new customers in a month', '300 minutes phone time', 'Rank first among your team' );
			$aPts = array( 30, 60, 90 );

			$nAwards = 10;
			for ($x = 1; $x <= $nAwards; $x++) {
				$n = rand(0,2);
				?><div class="achievementIcon" width="65px"><img src="<?=$aImages[$n];?>" width="60" title="<?=$aPts[$n] . 'pts: ' . $aDesc[$n];?>"><br /><b><?=$aNames[$n];?></b><br /> </div><?
			}
		?></center>
  		</div>
	</div>
</div>