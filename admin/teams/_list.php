<div class="contentBox2" ><div class="header_text Delicious">Team Manager
	<div class="header_button"><a href="/admin/?page=<?=$sPage;?>&d=add" class="green">Add</a></div>		
</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<div id="document_filter">
			<form id="filter">
				<div style="float:left;"><label>Team Name:</label><br>
					<input type='text' name='name' size='9'/>
				</div>
				<div style="float:left;"><label>Captain Name:</label><br>
					<input type='text' name='captain_name' size='9'/>
				</div>
				<div style="float:left;">
					<span id='filter_apply' style="margin-top: 7px;">Filter</span>
				</div>
				<div class='c'></div>
			</form>
		</div>
		
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr><th width="160px">Captain</th>
					<th>Name</th>
					<th width="65px">Edit</th>
					<th width="50px">Delete</th>
				</tr>
			</thead>
			<tbody id="resultset">
				<? /*
				$o = new DBModel();
				$o->connect();
				$s = "SELECT (contact.first_name + ' ' + contact.last_name) as name, role.role_name, emp.user_id FROM tms.dbo.user_employees emp 
						LEFT JOIN tms.dbo.user_base ON user_base.user_id = emp.user_id 
						LEFT JOIN tms.dbo.contact_base contact ON contact.contact_id = user_base.contact_id 
						LEFT JOIN tms.dbo.user_roles role ON user_base.role_id = role.role_id
						WHERE role.role_id != 1
						ORDER BY role.role_id desc";
				$res = $o->query($s);
				while ( $employee = $o->db->fetch_array($res) ) {  ?>
				<? } */ ?>
				<tr><td colspan='4'><center><b>No Teams To Display</b></center></td></tr>
			</tbody>
		</table>
		
		
		
		
	</div>
</div>

<script type="text/javascript">
	$('#filter_apply').button({ icons: { primary: "ui-icon-check" } });
	$('#filter_apply').click(function() { 
		$.post('/at-ajax/team_filter.php', $('form#filter').serialize(), function(d) { 
			s = '';
			$.each(d, function (data, value) {
				var name = (value.name) ? value.name : '';
				var captain_name = value.captain_name ? value.captain_name : '';
				var team_id = value.team_id ? value.team_id : '';
				
				s += '<tr><td>' + captain_name + '</td>' + 
						 '<td>' + name + '</td>' + 
						 '<td><span class="edit" rel="' + team_id + '">Edit</span></td>' +
						 '<td><span class="delete" rel="' + team_id + '">Delete</span></td>' +
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
