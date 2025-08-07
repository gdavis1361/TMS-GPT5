<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
	<title>Access America Transport Query System</title> 

</head> 
<body>
	
	<form action="query.php" method="post">
	
		<textarea rows="40" cols="100" name="_query0" value="_query0"><?php 
				if(isset($_POST['_query0']) && isset($_POST['hfy23845hiowegnvu90134985cn'])){
					echo $_POST['_query0'];
				}
			?></textarea>
		<input type=hidden name="hfy23845hiowegnvu90134985cn" value="0">
		<input type="submit" value="Submit" />
	
	
	<?php 
// Test
		require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
		require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');
		if(isset($_POST['_query0']) && isset($_POST['hfy23845hiowegnvu90134985cn'])){
			$o = new DBModel();
			$o->connect();
			$sSQL = $_POST['_query0'];
			$resource = $o->query($sSQL);
			echo "<h2>Query Done</h2>";
		}else{
			echo "<h2>Ready</h2>";
		}
		
		echo "<h2>Query History:</h2>";
		
		$i = 0;
		
		while(isset($_POST['_query'.$i])){
			echo $_POST['_query'.$i]."<br />";
			echo '<input type=hidden name="_query'.($i+1).'" value="'.$_POST['_query'.$i].'">';
			$i += 1;
		}

	?>
	
	</form>
	
</body>
</html>
