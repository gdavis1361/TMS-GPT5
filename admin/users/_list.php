<div class="contentBox2" ><div class="header_text Delicious">User Manager
	<div class="header_button"><a href="/admin/?page=<?=$sPage;?>&d=add" class="green">Add</a></div>		
</div>
	<div class="contentBox2_body" style="padding-left: 15px;">
		<div id="document_filter">
			<form id="filter">
				<div style="float:left;"><label>Name:</label><br>
					<input type='text' name='name' size='9'/>
				</div>
				<div style="float:left;"><label>Role:</label><br><?
					$oRoles = new UserRoles();
					
					echo $oRoles->make_list('user_role', 'user_role');
				?>
				</div>
				<div style="float:left;"><label>Branch:</label><br><?
					$oBranch = new UserBranches();
					
					echo $oBranch->make_list('branch_id', 'branch_id');
				?>
				</div>
				<div style="float:left;"><label>Start Date:</label><br>
					<input type="text" name="date_start" size="10" class="date" value=""> - 
					<input type="text" name="date_end" size='10' class="date" value="">
				</div>
				<div style="float:left;">
					<span id='filter_apply' style="margin-top: 7px;">Filter</span>
				</div>
				<div class='c'></div>
			</form>
		</div>
		
		<table width="100%" cellpadding="5px" cellspacing="0px" class="list">
			<thead>
				<tr><th width="200px">Name</th>
					<th width="160px">Branch</th>
					<th>Role</th>
					<th width="65px">Edit</th>
					<th width="50px">Delete</th>
				</tr>
			</thead>
			<tbody id="resultset">
				<tr><td colspan='5'><center><b>No Users To Display</b></center></td></tr>
			</tbody>
		</table>
		
		
		
		
	</div>
</div>

<script type="text/javascript">
	$('#filter_apply').button({ icons: { primary: "ui-icon-check" } });
	$('#filter_apply').click(function() { 
		$.post('/at-ajax/user_filter.php', $('form#filter').serialize(), function(d) { 
			s = '';
			$.each(d, function (data, value) {
				var name = (value.name) ? value.name : '';
				var role = value.role_name ? value.role_name : '';
				var hire_date = value.hire_date ? value.hire_date : '';
				var user_id = value.user_id ? value.user_id : '';
				var branch = value.branch_name ? value.branch_name : '';
				
				s += '<tr><td>' + name 		+ '</td>' + 
						 '<td>' + branch	+ '</td>' + 
						 '<td>' + role 		+ '</td>' + 
						 '<td><span class="edit" rel="' + user_id + '">Edit</span></td>' +
						 '<td><span class="delete" rel="' + user_id + '">Delete</span></td>' +
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
