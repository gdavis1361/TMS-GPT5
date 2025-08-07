<?php
$sSection = 'my page';
$sPage    = 'my stats';
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');
?>


<div class="contentBox2" id="leftNav">
	<div class="contentBox2_body">
		<?
		$nUserId = request('user', get_user_id() );
		$nContactId = get_user()->get('contact_id');
		$oEmployee = new UserEmployees();
		$aEmployeeIds = $oEmployee->list_employees( get_user_id() );
		//$aEmployeeIds = $oSession->session_var('contact_scope');
		
//Hoyt Change
		if ( !in_array($nUserId, $aEmployeeIds) ) {
			// Permission Denied
			$nUserId = get_user_id();
		}
		
		$oUserBase = new UserBase();
		$oUserBase->load($nUserId);

		$img = $oUserBase->get('image');
		if ( empty($img) ) $img = 'noimage.png';
		?>
		<center>
			<h3 style="margin-top: 0px"><?=$oUserBase->get_Contact()->get_FirstLastName();?></h3>
			<img src="/resources/<?=$img;?>" width="130px" style="border: 1px solid black">
		</center>
		<div id="employees_list">
			<?/*
			$oUser = new UserBase();
			$oUser->where('user_id', '=', $aEmployeeIds);
			$aContactIds = array();
			$aUserList = $oUser->list();

			foreach($aUserList->rows as $row){
				$aContactIds[$row->get('user_id')] = $row->get('contact_id');
			}

			$oContact = new ContactBase();
			$oContact->where('contact_id', '=', $aContactIds);
			$aContacts = $oContact->list()->rows;

			foreach($aContacts as $contact) {
				// Don't display the User's name
				$nTmpContactId = $contact->get('contact_id');
				if ($nTmpContactId == $nContactId) continue;
				$oContact->load( $nTmpContactId );

				$nEmployeeUserId = array_search($nTmpContactId, $aContactIds);
				?><div class="employee_link" userid="<?=$nEmployeeUserId;?>"><?=$oContact->get_FirstLastName();?></div><?
			}*/
			?>
		</div>
	</div>
</div>
<div id="mypage_right">
	<div class="contentBox2" id="myPage">
		<div class="header_text Delicious">myStats</div>
		<div class="contentBox2_body ">
		<?	
		
			function apply_unit_format($data, $format, $precision){
			
				if($data === NULL)
					$data = "-";
				
				if($format !== NULL && $format != ""){
					$format_array = explode("~",$format);
				}else{
					$format_array = array('','');
				}
				
				if(filter_var($data, FILTER_VALIDATE_FLOAT) || $data == 0){
					if($precision !== NULL){
						$data = round($data,$precision);
					}
					if(isset($format_array[2])){
						$data = $data * $format_array[2];
					}	
				}
				
				return $format_array[0].$data.$format_array[1];
			}
			
			function simple_data($date){
			
				$temp = explode(" ",$date);
				return $temp[0] .' '.$temp[1] .' '.$temp[2];
			
			}
		
			$oLeagueStats = new LeagueStats();
			$vLoaded = $oLeagueStats->load_by_user($nUserId);
			
			if ($vLoaded) {
	
				$mystats_db = new DBModel();	
				$mystats_db->connect();
				$sSQL = "SELECT * FROM dbo.mystats_def stat ".
					"LEFT JOIN tools_units tool ON stat.value_unit = tool.unit_id ".
					"ORDER BY row_order";
				$mystats_definitions = $mystats_db->query($sSQL);
			
			
				$units_db = new DBModel();	
				$units_db->connect();
				$sSQL = "SELECT unit_id, format, precision FROM dbo.tools_units ".
						"WHERE unit_id = '18'";				
				$units_definitions = $units_db->query($sSQL);
				$point_format = $units_db->db->fetch_array($units_definitions) ;
				$point_form = $point_format['format'];
				$point_perc = $point_format['precision'];
			
			
				$goals_db = new DBModel();	
				$goals_db->connect();
				$sSQL = "SELECT base.goal_class, base.goal_value, base.actual_value, base.goal_start, ".
					"base.goal_end, type.goal_name, type.attribute_id FROM dbo.goal_base base ".
					"LEFT JOIN dbo.goal_types type ON base.goal_type_id = type.goal_type_id ".
					"WHERE base.user_id = ".$nUserId;
				$goals_definitions = $goals_db->query($sSQL);
				
				$goal_data_array = array();
				
				while ( $goal_row = $goals_db->db->fetch_array($goals_definitions) ) {
				
					$my_asset_id = $goal_row['attribute_id'];
					if(!isset($goal_display_array[$my_asset_id]))
						$goal_display_array[$my_asset_id] = array();
					array_push($goal_display_array[$my_asset_id], $goal_row);

				}


				echo'<div id="StatTableHolder"><table id="MyStatsTable" width="100%" cellspacing="0px" cellpadding="5px">';
				echo"<tr><th>Statistics</th>".
					'<th width="80px">Value</th>'.
					'<th width="80px">Points</th>'.
					'<th width="80px">Goal</th></tr>';
				
				while ( $row = $mystats_db->db->fetch_array($mystats_definitions) ) {
				
					$cur_form = $row['format'];
					$cur_prec = $row['precision'];
				
					$value_entry = $oLeagueStats->get($row['value_col_name']);
					$value_entry = apply_unit_format($value_entry, $cur_form, $cur_prec);
					
					$point_entry = $oLeagueStats->get($row['point_col_name']);
					$point_entry = apply_unit_format($point_entry, $point_form, $point_perc);
					
					echo'<tr class="myStats_stat"><td>'.$row['attribute_name'].'</td>'.
						'<td width="80px">'.$value_entry.'</td>'.
						'<td width="80px">'.$point_entry.'</td>';
						
					$my_asset_id = $row['attribute_id'];
					
					if(isset($goal_display_array[$my_asset_id])){
						echo '<td width="80px" bgcolor="#ccccff"><a href="#" class="goal_clickable" name="_'.$row['value_col_name'].'">'.
								'Click to view</a></td></tr>';
						echo '<tr class="goal_drop_down _'.$row['value_col_name'].'"><td colspan="2" bgcolor="#FFFFFF" >'.
								$row['attribute_name'].' Goals:</td>';
						echo '<td colspan="2" bgcolor="#ccccff"><a href="#" class="goal_return">'.
								'Click here to return</a></td></tr>';		
						echo '<tr class="goal_drop_down _'.$row['value_col_name'].'"><td colspan="4" bgcolor="#FFFFFF" >';
						echo 	'<table  width="100%" cellspacing="0px" cellpadding="5px" ><tr>'.
								'<th width="15%">Class</th><th width="15%">Current</th><th width="15%">Target</th>'.
								'<th width="15%">Start</th><th width="15%">End</th><th width="25%">Progress</th></tr>';
						
						foreach ($goal_display_array[$my_asset_id] as $data_array){
							
							$my_actual_value = $data_array['actual_value'];
							$my_goal_value = $data_array['goal_value'];
							$my_bar_width = 200 * $my_actual_value/$my_goal_value;
						
							echo '<tr ><td>'.$data_array['goal_class'].'</td>';
							echo '<td>'.apply_unit_format($data_array['actual_value'], $cur_form, $cur_prec).'</td>';
							echo '<td>'.apply_unit_format($data_array['goal_value'], $cur_form, $cur_prec).'</td>';
							echo '<td>'.simple_data($data_array['goal_start']).'</td>';
							echo '<td>'.simple_data($data_array['goal_end']).'</td>';
							echo '<td>'.
								'<div style="background-color:#00f; width:200px">'.
								'<div style="background-color:#f00; width:'.$my_bar_width.'px">&nbsp;</div></div>'.
								'</td></tr>';
						}
						
						echo '</table></td></tr>';

					}else{
						echo '<td width="80px">None</td></tr>';
					}
					
				}
				
				echo"</table></div>";


			}else{

				echo '<span class="invalid_label">No record found for this user ID.</span>';
			} 
			

	?>	
		
		
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
				?><div class="achievementIcon" width="65"><img src="<?=$aImages[$n];?>" width="60" title="<?=$aPts[$n] . 'pts: ' . $aDesc[$n];?>"><br /><b><?=$aNames[$n];?></b><br /> </div><?
			}
		?></center>
  		</div>
	</div>
	<div class="contentBox2" ><div class="contentBox2_body">
	<? info(); ?>
	</div></div>
</div>


<script>

	//$(document).ready(function(){

		$('.goal_drop_down').hide();
		
		$('.goal_clickable').click(function() {
			var g_target = "."+$(this).attr('name');
			 $('#StatTableHolder').slideUp(400, function(){
				$('.myStats_stat').hide();
				$(g_target).show();
				$('#StatTableHolder').slideDown(400);
			});	
			
		} )
		
		$('.goal_return').click(function() {
		 	$('#StatTableHolder').slideUp(400, function(){
				$('.goal_drop_down').hide();
				$('.myStats_stat').show();
				$('#StatTableHolder').slideDown(400);
			})
			
		})

		$('.employee_link').click(function(){
			window.location.href = "/mypage/?user=" + $(this).attr('userid');
		});


		//TODO: Show additional info on outbound calls   ***************************************
		$('#total_outbound_calls').qtip({
			style: { name: 'blue' },
			position: {
				corner: { target: 'topMiddle', tooltip: 'bottomMiddle' }
			}
		});
	//TODO: Show additional info on Emails           ***************************************
	//}


</script>
<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');
?>




