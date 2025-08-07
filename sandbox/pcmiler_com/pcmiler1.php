<?php

	$start = "";
	$end = "";
	$mode = "";
	$distance = 0;
	$status = "OK";
	$Go = true;

	try{
		$COMobject = com_get_active_object("PCMServer.PCMServer");  
        // echo 'COM search performed<br />';
	}catch(Exception $e){
        // echo 'cant perform COM search: ' . $e->getMessage().'<br />';
	}
	
    if(!$COMobject){                     
    	//echo 'Com object created<br />'; 
    	$status = 'COM_CREATED';
		$COMobject = new COM("PCMServer.PCMServer") or die("no object created");       
    }else{   
        $status = 'COM_FOUND';
        // echo 'Com object found<br />';  
    }
	
    if(!$COMobject){
    	$status = 'ERROR_COM_NULL';
        $Go = false;
        // echo 'Com Null error<br />'; 
    }else{
        //echo 'Com exsists<br />';	
    }
	
	$params = $_REQUEST['json'];
	//$params = strtr($params, '&', ' and ');
    $json = json_decode($params);
	
	foreach ($json as $key => $leg){
		
    	if($Go){
    		$st = $leg->start;
            $en = $leg->end;
            $mo = $leg->mode;
        
        	if(isset($st->city) && $st->city != "" && isset($st->state) && $st->state != ""){
        		$start = $st->city .",".$st->state;
        	}else if(isset($st->zip) && $st->zip != ""){
       			$start = $st->zip;
       		}else{
       			$status = 'ERROR_BAD_START';
       			$Go = false;
       		}
			
        	if(isset($en->city) && $en->city != "" && isset($en->state) && $en->state != ""){
        		$end = $en->city .",".$en->state;
        	}else if(isset($en->zip) && $en->zip != ""){
       			$end = $en->zip;
       		}else{
       			$status = 'ERROR_BAD_END';
       			$Go = false;
       		}
			
       		switch($leg->mode[0]){
       			case '1':case '2':case '3':case '4':case '5':case '6':
       				$mode = $leg->mode[0];
       			break;
       			default:
       			 	$mode = 0;
       			break;
            }
       		if($Go){
       			try{
            		$distance = $COMobject->CalcDistance2($start, $end, $mode) * (.1);
                    //echo "Lookup: ".$distance;
                }catch(Exception $e){
            		$status = htmlspecialchars($e->getMessage());
					//$status = 'ERROR_LOOKUP';
                }
			}
		}
					 				 	
		$leg->status = $status."";
        $leg->distance = $distance."";
 
	}	
                
	echo '"PCMiler":' . json_encode($json) ;	
	
?>