<div class="contentBox2" >
	<div class="header_text Delicious">Roles Manager
		<div class="header_button"><a href="/admin/?page=<?=$sPage;?>" class="red">Back</a></div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=<?=$sPage;?>" method="post" id="add_form" enctype='multipart/form-data'>
			<input type="hidden" name="id" value="<?=$nId;?>">
			<input type="hidden" name="a" value="<?=$sDisplay;?>">
			<div><b>Name</b><br>
				<input type="text" style="width: 180px" name="role_name" value="<?=$aVars['role_name'];?>">
			</div>
			<div><b>Landing Page</b><br>
				<input type="text" style="width: 180px" name="landing_page" value="<?=$aVars['landing_page'];?>">
			</div>
			<div><b>Mode</b><br>
			<?
				$oModes = new Modes();
				echo $oModes->make_list('mode_id', 'mode_id', $aVars['mode_id']);
			?>
			</div>
			
			<div><input type="submit" value="Save"></div>
		</form>
	</div>
</div>

<script type="text/javascript">
	$('input[type=submit]').button();
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