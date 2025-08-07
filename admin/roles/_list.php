<div class="contentBox2" ><div class="header_text Delicious">Role Manager
	<div class="header_button"><a href="/admin/?page=<?=$sPage;?>&d=add" class="green">Add</a></div>		
</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr><th width="160px">Name</th>
					<th>Landing Page</th>
					<th>Mode Name</th>
					<th width="65px">Edit</th>
					<th width="50px">Delete</th>
				</tr>
			</thead>
			<tbody id="resultset">
				<? 
				$o = new DBModel();
				$o->connect();
				$s = "SELECT role.role_id, role.role_name, role.landing_page, modes.mode_name FROM user_roles role
						LEFT JOIN modes ON modes.mode_id = role.mode_id";
				$res = $o->query($s);
				while ( $row = $o->db->fetch_array($res) ) {  ?>
					<tr><td><?=$row['role_name'];?></td>
						<td><?=$row['landing_page'];?></td>
						<td><?=$row['mode_name'];?></td>
						<td><a href="/admin/?page=<?=$sPage;?>&d=edit&id=<?=$row['role_id'];?>">Edit</a></td>
						<td></td>
					</tr>
				<? }  
				// <tr><td colspan='4'><center><b>No Roles To Display</b></center></td></tr>
				?>
			</tbody>
		</table>
		
		
		
		
	</div>
</div>

<script type="text/javascript">
	$('#filter_apply').button({ icons: { primary: "ui-icon-check" } });
	$('#filter_apply').click(function() { 
		$.post('/at-ajax/role_filter.php', $('form#filter').serialize(), function(d) { 
			s = '';
			$.each(d, function (data, value) {
				var name = (value.name) ? value.name : '';
				var captain_name = value.captain_name ? value.captain_name : '';
				var role_id = value.role_id ? value.role_id : '';
				
				s += '<tr><td>' + captain_name + '</td>' + 
						 '<td>' + name + '</td>' + 
						 '<td><span class="edit" rel="' + role_id + '">Edit</span></td>' +
						 '<td><span class="delete" rel="' + role_id + '">Delete</span></td>' +
					'</tr>';
			});
			if (s.length > 0) {
				$('#resultset').html(s);
			}else{
				$('#resultset').html("<tr><td colspan='5'><center><b>No Users To Display</b></center></td></tr>");
			}
			$('.edit').button({
				icons: { primary: 'ui-icon-gear' }
			});	
			
			$('.delete').button({
				icons: { primary: 'ui-icon-closethick'},
				text: false
			});

		}, 
		'json');
	});


$('.delete').live('click', function() {
	var id = $(this).attr('rel');
	alert('delete ' + id);
	//window.location = "/admin/?page=tasks&d=confirm&id="+id;
});

$('.date').datepicker();

$('.edit').live('click', function() {
	var id = $(this).attr('rel');
	//alert('edit ' + id);
	window.location = "/admin/?page=<?=$sPage;?>&d=edit&id="+id;
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
