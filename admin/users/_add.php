<div class="contentBox2" >
	<div class="header_text Delicious">User Manager <?php echo ucfirst($sDisplay); ?>
		<div class="header_button"><a href="/admin/?page=<?php echo $sPage; ?>" class="red">Back</a></div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=<?php echo $sPage; ?>" method="post" id="add_form">
			<input type="hidden" name="user_id" value="<?php echo $aVars['user_id']; ?>">
			<input type="hidden" name="a" value="<?php echo $sDisplay; ?>">
			
			<?php
			if ($sDisplay == 'edit') {
				?>
				<h2><?php echo $aVars['first_name'] . " " . $aVars['last_name']; ?></h2>
				<div id="tabs">
					<ul>
						<li><a href="#contact_info">Contact Info</a></li>
						<li><a href="#user_info">User Info</a></li>
						<li><a href="#employee_info">Employee Info</a></li>
						<li><a href="#other_info">Other Info</a></li>
					</ul>
					<?php
				}
				?>
				<div id="contact_info">
					<div>
						<div style="float: left;"><b>First Name:</b> <br>
							<input type="text" name="first_name" value="<?php echo $aVars['first_name']; ?>" size="30"/>
						</div>
						<div style="float: left;"><b>Last Name:</b> <br>
							<input type="text" name="last_name" value="<?php echo $aVars['last_name']; ?>" size="30" />
						</div>
						<div style="clear: both;"></div>
					</div>
					<div><b>Contact Type:</b><br>
						<?php
						$oContactTypes = new ContactTypes();
						echo $oContactTypes->make_list('contact_type_id', 'contact_type_id', $aVars['contact_type_id']);
						?>
					</div>
				</div>
				<div id="user_info">
					<div><b>Username:</b><br>
						<input type="text" name="user_name" style="width: 120px" value="<?php echo $aVars['user_name']; ?>" readonly="readonly" />
					</div>
					<div><b>Password:</b><br>
						<input type="password" name="pass_one" style="width: 120px" /> &nbsp;
						<input type="password" name="pass_two" style="width: 120px" /> (confirm)
					</div>
					<div><b>Role</b><br>
						<?php
						$oRoles = new UserRoles();
						echo $oRoles->make_list('role_id', 'role_id', $aVars['role_id'])
						?>
					</div>
				</div>
				<div id="employee_info">
					<div><b>SSN:</b><br>
						<input type="text" name="ssn_no" style="width: 150px;" value="<?php echo $aVars['ssn_no']; ?>"/>
					</div>
					<div><b>Photo:</b><br>
						<input type="file" name="user_photo">
					</div>
					<?php if ($sDisplay == 'edit') { ?>
						<div><b>Employee Number:</b><br>
						#<?php echo $aVars['employee_number']; ?>
						</div>
					<?php } ?>
					<div><b>Hire Date:</b><br>
						<?php if ($sDisplay == 'edit') { ?>
							<?php echo $aVars['hire_date']; ?>
						<?php } else { ?>
							<input type="text" name="hire_date" style="width: 120px;"  />
						<?php } ?>
					</div>
				</div>
				<div id="other_info">
					<div><b>Supervisor:</b><br>
						<input type="text" name="supervisor_search" style="width: 120px;" value="<?php echo $aVars['supervisor_name']; ?>">
						<input type="hidden" name="supervisor_id"  value="<?php echo $aVars['supervisor_id']; ?>">
						<input type="hidden" name="pod_id"  value="<?php echo $aVars['pod_id']; ?>">
					</div>
					<div><b>Team:</b><br>
						<?php
						$oTeams = new LeagueTeams();
						
						echo $oTeams->make_list('league_team_id', 'league_team_id', $aVars['league_team_id']);
						?>
					</div>
					<div><b>Branch:</b><br>
						<?php
						$oBranch = new UserBranches();
						
						echo $oBranch->make_list('user_branch', 'user_branch', $aVars['user_branch']);
						?>
					</div>
				</div>
			<?php if ($sDisplay == 'edit') { ?> </div> <?php } // Tabs div ?>
			
			<input type="submit" value="Save" />
		</form>
	</div>
</div>
<script type="text/javascript">
	$(function() {
		$( "#tabs" ).tabs();
	});
	$('input[name=hire_date]').datepicker();
	$('input[type=submit]').button();
	$('input[name=first_name], input[name=last_name]').keyup(function() {
		var first = $('input[name=first_name]').val().toLowerCase();
		var last = $('input[name=last_name]').val().toLowerCase();
		if (first.length > 0 && last.length > 0) {
			var username = first.substr(0,1) + last;
			$('input[name=user_name]').val(username);
		}
	});
	
	$( "input[name=supervisor_search]" ).autocomplete({
		source: "/at-ajax/employee_search.php",
		minLength: 2,
		select: function( event, ui ) {
			//alert(ui.item.label + ' is Captain of Pod #' + ui.item.pod_id);
			$('input[name=supervisor_id]').val(ui.item.user_id);
			$('input[name=pod_id]').val(ui.item.pod_id);
			$('select[name=league_team_id]').val(ui.item.team_id);
		}
	});

</script>

<style type="text/css">
	#tabs > div > div {
		margin: 10px 0px;
	}
	
	#add_form > div {
		background-color: #fff;
		margin: 10px 0px;
		width: 100%;
	}
	
	#add_form input[type=text]:hover, #add_form textarea:hover, #add_form input[type=password]:hover {
		background-color: #ffe;
	}
	
	#add_form input[type=text], #add_form textarea, #add_form input[type=password] {
		font-family: arial;
		font-size: 14px;
		border: 1px solid #838383;
		width: 60%;
		padding: 5px;
		-moz-border-radius: 5px;
		border-radius: 5px;
	}
</style>