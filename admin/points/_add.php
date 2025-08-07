<div class="contentBox2" >
	<div class="header_text Delicious">League Points Manager
		<div class="header_button"><a href="/admin/?page=<?=$sPage;?>" class="red">Back</a></div>
	</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<form action="/admin/?page=<?=$sPage;?>" method="post" id="add_form" enctype='multipart/form-data'>
			<input type="hidden" name="point_id" value="<?=$nId;?>">
			<input type="hidden" name="a" value="<?=$sDisplay;?>">
			<div><b>Point Name</b><br>
				<input type="text" style="width: 180px" name="point_type_name" value="<?=$aVars['point_type_name'];?>">
			</div>
			<div><b>Point Group</b><br>
				<?
				$oPointGroup = new LeaguePointGroups();
				echo $oPointGroup->make_list('point_type_group_id', 'point_type_group_id', $aVars['point_type_group_id']);
				?>
			</div>
			<div><b>Point Value</b><br>
				<input type="text" style="width: 180px" name="point_value" value="<?=$aVars['point_value']?>">
			</div>
			<div><b>Units</b><br>
				<?
				$oUnits = new ToolsUnits();
				echo $oUnits->make_list('unit_type_id', 'unit_type_id', $aVars['unit_type_id']);
				?>
			</div>
			<div><b>Effective Date</b><br>
				<input type="text" style="width: 180px" name="effective_date" class="date" value="<?=empty($aVars['effective_date']) ? date('m/d/Y') : date('m/d/Y', strtotime($aVars['effective_date']));?>">
			</div>
			
			<div>
				<input type="submit" value="Save">
			</div>
		</form>
	</div>
</div>
<script type="text/javascript">
	$('input[type=submit]').button();
	$('.date').datepicker();
	$('.date').datepicker( "option", "showAnim", "slideDown");
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