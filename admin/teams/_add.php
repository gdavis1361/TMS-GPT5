<div class="contentBox2" >
	<div class="header_text Delicious">Teams Manager
		<div class="header_button"><a href="/admin/?page=<?=$sPage;?>" class="red">Back</a></div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=<?=$sPage;?>" method="post" id="add_form" enctype='multipart/form-data'>
			<input type="hidden" name="point_id" value="<?=$nId;?>">
			<input type="hidden" name="a" value="<?=$sDisplay;?>">
			<div><b>Name</b><br>
				<input type="text" style="width: 180px" name="team_name" value="<?=$aVars['team_name'];?>">
			</div>
			<div><b>Pic</b><br>
				<input type="file" name="team_pic">
			</div>
			<div><b>Team Captain</b><br>
				<?	$oCaptain = new UserBase();
					$oCaptain->load($aVars['captain_id']);
					$oCaptContact = $oCaptain->get_Contact();
					$sCaptainName = $oCaptContact->get_FirstLastName();
				?>
				<input type="hidden" name="captain_id" value="<?=$aVars['captain_id'];?>"/>
				<input type="text" style="width: 180px" name="captain_search" value="<?=$sCaptainName;?>" />
			</div>
			
			<div><input type="submit" value="Save"></div>
		</form>
	</div>
</div>
<script type="text/javascript">
	$('input[type=submit]').button();
	$('.date').datepicker();
	$('.date').datepicker( "option", "showAnim", "slideDown");
	$( "input[name=captain_search]" ).autocomplete({
		source: "/at-ajax/employee_search.php",
		minLength: 2,
		select: function( event, ui ) {
			$('input[name=captain_id]').val(ui.item.user_id);
		}
	});
</script>

<style type="text/css">
	#add_form > div {
		background-color: #fff;
		margin: 10px 0px;
		width: 100%;
	}
	
	#add_form input[type=text]:hover, #add_form textarea:hover {
		background-color: #ffe;
	}
	
	#add_form input[type=text], #add_form textarea {
		font-family: arial;
		font-size: 14px;
		border: 1px solid #838383;
		width: 60%;
		padding: 5px;
		-moz-border-radius: 5px;
		border-radius: 5px;
	}
</style>