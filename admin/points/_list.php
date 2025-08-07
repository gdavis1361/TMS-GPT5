<div class="contentBox2" >
	<div class="header_text Delicious">League Points Manager</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
			
		<div id="document_filter">
			<form id="filter">
				<div style="float:left;"><label>Name:</label><br>
					<input type='text' name='filter_name' size='9'/>
				</div>
				<div style="float:left;"><label>Group:</label><br><?
					$oGroup = new LeaguePointGroups();
				echo $oGroup->make_list('filter_group_id', 'filter_group_id', $aFilter['group_id']);
				?>
				</div>
				<div style="float:left;">
					<span id='filter_apply' style="margin-top: 7px;">Filter</span>
				</div>
				<div class='c'></div>
			</form>
		</div>
	
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr><th>Name</th>
					<th width="100px">Point Group</th>
					<th width="150px">Value</th>
					<th width="65px">History</th>
					<th width="65px">Edit</th>
				</tr>
			</thead>
			<tbody id="resultset">
			<?
			$o = new DBModel();
			$o->connect();
			$s = "SELECT type.point_type_id, type.point_type_name, value.effective_date, value.point_value, point_group.group_name, unit.unit_name FROM tms.dbo.league_point_types type
					LEFT JOIN tms.dbo.league_point_values value ON value.point_type_id = type.point_type_id
					LEFT JOIN tms.dbo.league_point_groups point_group ON point_group.group_id = type.point_type_group_id
					LEFT JOIN tms.dbo.tools_units unit ON unit.unit_id = type.unit_type_id
					WHERE value.active = '1' 
					" .( !empty($aFilter['name']) ? "AND type.point_type_name LIKE '%" . $aFilter['name'] . "%' " : "" ) .
					( !empty($aFilter['group_id']) ? "AND point_group.group_id = '" . $aFilter['group_id'] . "' " : "" ) . "
					ORDER BY point_group.group_name DESC";
			$res = $o->query($s);
			
			while ($row = $o->db->fetch_object($res) ) {
			?><tr><td><?=$row->point_type_name;?></td>
				<td><?=$row->group_name;?></td>
				<td><?=$row->point_value;?> pt<?=$row->point_value == 1 ? '' : 's';?> per <?=rtrim($row->unit_name, 's');?></td>
				<td>History</td>
				<td><span class="edit" rel="<?=$row->point_type_id;?>">Edit</span></td>
			</tr>
			<? } ?>
			</tbody>
		</table>
		
		
	</div>
</div>
<div style="background-color: #fff" id="ajax"></div>

<script type="text/javascript">
$(document).ready( function() {
	$('#filter_apply').button({ icons: { primary: "ui-icon-check" } });
	$('#filter_apply').click(function() { 
		$.post('/at-ajax/point_filter.php', $('form#filter').serialize(), function(d) { 
			s = '';
			$.each(d, function (data, value) {
				var name = (value.point_type_name) ? value.point_type_name : '';
				var group = (value.group_name) ? value.group_name : '';
				var point_value = (value.point_value) ? value.point_value : '';
				var unit = (value.unit_name) ? value.unit_name : '';
				var id = (value.point_type_id) ? value.point_type_id : '';
				
				
				s += '<tr><td>' + name + '</td>' +
						'<td>' + group + '</td>' + 
						'<td>' + point_value + ' pt' + (point_value == 1 ? '' : 's' ) + ' per ' + unit.substring(0, unit.length - 1) + '</td>' +
						'<td>History</td>' +
						'<td><span class="edit" rel="' + id + '">Edit</span></td>' +
					'</tr>'
			});
			$('#resultset').html(s);
			$('.view').button({
				icons: { primary: 'ui-icon-script' }
			});
			$('.edit').button({
				icons: { primary: 'ui-icon-gear' }
			});
		}, 
		'json');
	});
	$('.edit').button({
		icons: { primary: 'ui-icon-gear' }
	});
	$('.edit').live('click', function() {
		var id = $(this).attr('rel');
		//alert('edit ' + id);
		window.location = "/admin/?page=<?=$sPage;?>&d=edit&id="+id;
	});
	$('.date').datepicker();
	$('.date').datepicker( "option", "showAnim", "slideDown");
});
</script>

<style type='text/css'>
	#filter > div {
		padding: 0px 10px;
	}
	
	#document_filter {
		border: 1px solid #0f0f0f;
		padding: 5px 0px;
		margin: 5px 0px;
		background-color: #f0f0f0;
	}
</style>
