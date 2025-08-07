<?php 
		ini_set("display_errors", 1);
		ini_set("display_startup_errors", 1);
		error_reporting(E_ALL);
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
	<title>PCiller test</title> 

</head> 
<body>

	Html: Works<br />
        
	<?php
		//phpinfo();
        
                $COMobject = false;
        
		echo "Php: Works<br />";
                
                try{

                    $COMobject = com_get_active_object("PCMServer.PCMServer");
                    
                    echo 'COM search performed<br />';
                
                }catch(Exception $e){
                    
                     echo 'cant perform COM search: ' . $e->getMessage().'<br />';
                    
                }
                    
                if(!$COMobject){                  
                        
                    echo 'Com object created<br />';
                        
                   $COMobject = new COM("PCMServer.PCMServer") or die("no object created");
                        
                }else{
                        
                    echo 'Com object found<br />';
                        
                }
                    
                com_print_typeinfo($COMobject);
                
                
                try{

                    echo '<br />Distance 2: '.$COMobject->CalcDistance2("Atlanta,GA", "Chattanooga,TN",1) .'<br />';
                
                }catch(Exception $e){
                    
                     echo 'cant perform look-up 2: '.$e->getMessage().'<br />';
                    
                }

            ?>
	
	<br />
</body>