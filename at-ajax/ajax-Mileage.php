<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');


   /*   To use this file, send it a POST variable 'ajax' whit a json string
    *   Formated in the following way (note - NAME:VALUE)
    * 
    *   The first NAME is a unique string identifier for the momemnt.  Its 
    *   value is an object which contains three NAMES.  The first is 'start'.
    *   This represents a starting location.  It contains four NAMES: 'street', 
    *   'city', 'state', and 'zip'.  These are all strings, all of which are optional.
    *   various combinations can be used.  After 'start', the next NAME is
    *  'end'.  This NAME holds another object similar to 'start'.  It also 
    *   specifies a location, with a 'street', 'city', 'state', and 'zip'.
    *   finally, the third NAME is 'mode'.  THis contains an array of strings,
    *   each representing a mode which is to be used for the trip.  Several 
    *   different movements can be calculated at once.  To specify a second 
    *   Movement, add an addional object def with a different unique ID 
    *   string after the first object def.  (see example below)
    *   
    *   When the process is finished, another json object will be returned to
    *   the URL request.  Its structure is very similar.  It can have several
    *   different NAMES, each corisponding to a mileage service ('PCMiler', 
    *   'Google', etc...) the VALUE is a full copy copy of request json object
    *   with two additional NAMES.  'status' has a VALUE which gives info about 
    *   the moement request and 'distance' holds the distance of the movement. 
    *   each service NAME could also contain a string as a VALUE.  These cases 
    *   usually involve errors. 
    * 
    */ 


     $ExampleJson = '{
                        "Move1":{
                            "start":{
                                "street":"",
                                "city":"New York",
                                "state":"NY",
                                "zip":""
                            },"end":{
                                "street":"",
                                "city":"Chattanooga",
                                "state":"TN",
                                "zip":""
                            },"mode":["Normal"]
                        
                        },
                        "Move2":{
                            "start":{  
                                "street":"",
                                "city":"Jonesboro",
                                "state":"GA",
                                "zip":""
                            },"end":{
                                "street":"",
                                "city":"Atlanta",
                                "state":"GA",
                                "zip":""
                            },"mode":["Normal"]
                        
                        }
                     }';  
        
     $OutputJson = '{
                        "PCMiler":"ERROR_NO_DATA",
                        "Google":{
                            "Move1":{
                                "start":{
                                    "street":"",
                                    "city":"New York",
                                    "state":"NY",
                                    "zip":""
                                 },"end":{
                                    "street":"",
                                    "city":"Chattanooga",
                                    "state":"TN",
                                    "zip":""
                                 },"mode":["Normal"],
                                 "status":"OK",
                                 "distance":"818 mi"
                             },"Move2":{
                                 "start":{
                                    "street":"",
                                    "city":"Jonesboro",
                                    "state":"GA",
                                    "zip":""
                                 },"end":{
                                    "street":"",
                                    "city":"Atlanta",
                                    "state":"GA",
                                    "zip":""
                                 },"mode":["Normal"],
                                 "status":"OK",
                                 "distance":"17.3 mi"
                            }
                        }
                    }';
        



    require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/Mileage/Access_PCMiler.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/Mileage/Access_Google.php');
    
    $JSONdata = "";
    
   
    if(isset($_GET['json'])&&$_GET['json']!= ""){
    
        $JSONdata .= urldecode($_GET['json']);
    
    }else{
        
       // $JSONdata .= $ExampleJson;           
    }
    
    $Results = "{";
    
    $PCMilerConnection = new Access_PCMiler();
    
    $PCMilerResults = $PCMilerConnection->sendRequest($JSONdata);
    
    if(!stristr($PCMilerResults,'PCMiler')){
        
       $PCMilerResults = '"PCMiler":"ERROR_NO_DATA"';
    }
	$GoogleConnection = new Access_Google();

	$GoogleResults = $GoogleConnection->sendRequest($JSONdata);

	if(!stristr($GoogleResults,'Google')){

		$GoogleResults = '"Google":"ERROR_NO_DATA"';

	}
    
    
    
    $Results = "{".$PCMilerResults .",".$GoogleResults."}";
    
    echo $Results;

    
    //echo "<br /><br />".$json2->Google->Move1->start->city;


    
?>