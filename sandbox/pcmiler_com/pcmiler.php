<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
	<title>PCiller test</title> 
	<script src="/resources/js/jquery-1.4.3.min.js" type="text/javascript"></script>
</head> 
<body>

	<h1>PCMiller test</h1>
	
	<span></span>

	<script type="text/javascript" charset="utf-8">
		$("div").append("<br />Java Script Active... <br />");

		var sdfqwf = new PCMILER_AJAX('sdfqwf');
		
		sdfqwf.Set_Type(1);
		//sdfqwf.Sent_Callback(getData);
		
		setInterval('tryAgain()', Math.random()*1000);
                
		var count = 100;
		
		function tryAgain(){
	
			$("span").append("<br />#"+count);
                        
                        //sdfqwf.Send_Movement(count,1+count);
                       // sdfqwf.Send_Movement("Atalnta,GA","Chattanooga,TN",getData1);
                        sdfqwf.Send_Movement(Math.round(Math.random()*500)+100,"Atlanta,GA",getData1);
                        sdfqwf.Send_Movement(Math.round(Math.random()*500)+100,100,getData2);
                       // sdfqwf.Send_Movement(302,300,getData2);
			count += 1;

		}
		
		function getData(myId, myData){
                        $("span").append("<br />GD0:"+myId+" - >>> "+myData);
		}
		function getData1(myId, myData){
			 $("span").append("<br />GD1:"+myId+" - >>> "+myData);
		}
		function getData2(myId, myData){
			 $("span").append("<br />GD2:"+myId+" - >>> "+myData);
		}
                
                
		
		function PCMILER_AJAX(myName){
		
			this.strObjectName = myName;
		
			//this.strAddress = "pcmiler_gate.php";
			//this.strAddress = "http://192.168.10.100:8080/pcmiler1.php";
			this.strAddress = "pcmiler1.php";
			
			this.arrAjaxStack = [];
			
			this.objDistance = {};

			this.objCallbackOverride = {};

			this.booReady = true;
			this.booLocked = false;
			
			this.strType = "1";
			this.funCallback;
			this.DEBUG = false;

			
			this.AJAXtimer = setTimeout("",1);
			this.AJAXretry;
			
			this.strSavedStart = null;
			this.strSavedEnd = null;
			

					
/*
			
function Send_Movement
			
this function will take a start and ending location and generate a callback which will provide the 
distance between the two points.  You must have a route type and a callback function defigned 
before you can use this function (these can be set via Set_Type() and Set_Callback().) 
If a callback is specified via the optional thrid paramater, that function will be used 
instead of the callback function provided by Set_Callback(). Send_Movement will return a 
unique string which can be used later to identify the callback which contains the correct distance
for the specified movement. Please note that the callbacks could be performed in any order and 
there is a possibility that the callbacks will not happen if there is a network failure.

	v1:	a string representing the start location (zipcode, Latitude/longitude, 'city,state code')
	v2: a string representing the end location (zipcode, Latitude/longitude, 'city,state code')
	v3(optiona): callbackOverride, a function which will be used for the callback 
	
	returns: a string that uniquly identifies the request.


*/			
			
		this.Send_Movement = function (start, end, callbackOverride){
		
				this.trace("----- Send_Movement Called: ("+start+", "+end+")");
				
				var identifier;
				
				if(start && (start+"").slice(0,2) == "m~"){
				
					identifier = start;
					
				}else{

					if(this.strSavedStart && this.strSavedStart != "")
						start = this.strSavedStart;
					
					if(this.strSavedEnd && this.strSavedEnd != "")
						end = this.strSavedEnd;
					
					this.strSavedStart = "";
					this.strSavedEnd = "";

					if(!start || !end ){
						return 0;
					}

					identifier = "m~"+start+"~"+end+"~"+this.strType;
				
				}

				identifier = identifier.replace(/\?/gi, "");
				identifier = identifier.replace(/\&/gi, "and");
				
				this.trace("Identifier: "+identifier);
				
				
				
				if(this.objDistance.hasOwnProperty(identifier)){
				
					var targetDistance = this.objDistance[identifier];
					
					this.trace("Perform: CALLBACK:"+targetDistance);
					
					if(typeof callbackOverride == "function"){
						callbackOverride(identifier, targetDistance);
					}else if(typeof this.funCallback == 'function'){
						this.funCallback(identifier, targetDistance);
					}

				}else{
				
				
				
					if(!this.objCallbackOverride.hasOwnProperty(identifier)){
						this.objCallbackOverride[identifier] = [];
						this.arrAjaxStack.push(identifier);
					}
					
					if(typeof callbackOverride == 'function'){
						this.objCallbackOverride[identifier].push(callbackOverride);
					}else if(typeof this.funCallback == 'function'){
						this.objCallbackOverride[identifier].push(this.funCallback);
					}

					if(this.booReady && !this.booLocked){
						this.trace("Perform: AJAX CALL");
						this.Perform_Ajax();
					}else{
						this.trace("Perform: AJAX QUERY");
					}
					
				}
				
				this.trace("----- Send_Movement Done<br />");
					
				return identifier;	

			} 
			
/*

function Lock and Unlock

These functions are intended to allow the user to add several requests to one ajax call
however, there is a timer function which attempts to perform this task.  These functions
should not be needed.	
			
			this.Lock = function (){
				this.trace("-- Locked<br />");
				this.booLocked = true;
			}	
			
			this.Unlock = function(){
				this.trace("-- Unlocked<br />");
				this.booLocked = false;
				if(this.arrAjaxStack.length > 0){
					this.Perform_Ajax();
				}
			}
			
*/
			

/*

function Set_Start

This function will format street, city and state values for the starting location and save it
for the Send_Movement function.  It will override any values sent into Send_Movement and after
Send_Movement is called, the saved values will be reset.

	v1: street name (if there is no street, use "")
	v2: city
	v3: state
	
	Note: Street is currently disabled
			
*/			
			
			
			this.Set_Start = function (street, city, state){
				output = "";
				if(city && city != "" && state && state != ""){
					//if(street && street != ""){
					//	output = city+","+state+";"+street;
					//}else{
						output = city+","+state;
					//}
				}
						
				this.strSavedStart = output;
			
			}
			
/*

function Set_End

This function will format street, city and state values for the ending location and save it
for the Send_Movement function.  It will override any values sent into Send_Movement and after
Send_Movement is called, the saved values will be reset.

	v1: street name (if there is no street, use "")
	v2: city
	v3: state
	
	Note: Street is currently disabled
	
*/
			
			this.Set_End = function (street, city, state){
				output = "";
				if(city && city != "" && state && state != ""){
					//if(street && street != ""){
					//	output = city+","+state+";"+street;
					//}else{
						output = city+","+state;
					//}
				}
						
				this.strSavedEnd = output;
			
			}			

			
/*
function Set_Type

This function sets the route type which is used by pcMiler.  It will be used by all function
calls until a new Type is set. 

	v1: an numeric rout type.  The following numbers can be used:

0	Practical		The default routing type: most practical
1	Shortest		shortest by distance
2	National		favor national highways
3	AvoidToll		avoid tolls
4	Air				air (straight line)
6	FiftyThree		53' truck routing

	

*/

			this.Set_Type = function (type){
				this.trace("-- Set_Type:"+type+"<br />");
				this.strType = type;
				
			}	
			
/*
function Set_Callback

This function will set the global call back function.  This function will be called when 
an ajax all is successfully completed.  

	v1: a reference to the function which is to be called when an ajax call is completed

the call back function must accept two properties:

	v1: a string which identified the movement (this string is returned by Send_Movement())
	v2: the distance of that movement in miles
	
note: although this callback will be used by every request, individual callback functions
can be set for each request via the callbackOverride poperty of Send_Movement()
	
*/
			
			this.Sent_Callback = function (func){
				this.trace("-- Set_Callback<br />");
				this.funCallback = func;
			}

/*
function Get_Distance

This function will attempt to return a movement's distance.  If the distance has
already been aquired from PCMiler, it will be retunred.  If not, then 0 is returned.
note: unlike Send_Movement, this function will always return a value
    
	v1: A movement's unique string ID

*/
                        
                        this.Get_Distance = function (identifier){
				if(this.objDistance.hasOwnProperty(identifier))
                                    return this.objDistance[identifier];
					
				return 0;
			}
                        
                        
			
/* 
function Perform_Ajax --- Internal functions
*/

			this.Perform_Ajax = function(){
			
				this.trace(this.strObjectName+".Perform_Ajax2()");
				clearTimeout(this.AJAXtimer);
				this.AJAXtimer = setTimeout(this.strObjectName+".Perform_Ajax2()",10);
				
				
			}

			this.Perform_Ajax2 = function(dataString){
			
				this.trace("----- Perform_Ajax Called");
			
				this.booReady = false;
                                
                                if(!dataString)
                                    dataString = "?format=tmsjson&ObjectName="+this.strObjectName;
				
                                var i = 0;
				var ContinueAjax = false;
				
				while(this.arrAjaxStack.length > 0){
					this.trace("AJAX POST data added");
					
					var identifier = this.arrAjaxStack.shift();
					var DistanceFound = this.Perform_Callbacks(identifier);

					if(!DistanceFound){
						dataString = dataString + "&data"+i+"="+identifier;
						i += 1;
						ContinueAjax = true;
					}
				}
				
				this.trace("AJAX DataString:  "+dataString);

				if(ContinueAjax){
				
					$.ajax({
						 cache: false,
 						 url: this.strAddress,
 						 dataType: 'json',
 						 data: dataString,
 						// success: this.Process_Ajax_return,
 						 success:  Pcmiler_ajax_return,
 						 type: 'POST'
					});
					
					this.AJAXretry = setTimeout(this.strObjectName+".Retry_Ajax('"+dataString+"')",5000);
					
				}else{
					this.trace("AJAX skipped");
				}
				this.trace("----- Perform_Ajax Done<br />");
				
			}
			
			this.Retry_Ajax = function(dataString){
                            
                            
					this.trace(">>> Retry_Ajax Done"+dataString+"<br />");
			
                                        this.Perform_Ajax2(dataString);
                        
                                        
                                        /*
                         
                                        $.ajax({
						 cache: false,
 						 url: this.strAddress,
 						 dataType: 'json',
 						 data: dataString + "redo",
 						// success: this.Process_Ajax_return,
 						 success:  Pcmiler_ajax_return,
 						 type: 'POST'
					});
                                        
                                        */

			}
		
			function Pcmiler_ajax_return(data, textStatus, jqXHR){ 
				window[data.ObjectName].Process_Ajax_return(data, textStatus, jqXHR);
			}

			this.Process_Ajax_return = function (data, textStatus, jqXHR){ 
			
				this.trace("----- Process_Ajax_return Called");
				
				clearTimeout(this.AJAXretry);
				
				var targetDistance;
			
				for (identifier in data){  
					
					if(identifier.slice(0,2) != "m~")
						continue;

					targetDistance = data[identifier];
					
					this.objDistance[identifier] = targetDistance;
					
					this.trace("id:"+identifier+" distance:"+targetDistance);
					
					this.Perform_Callbacks(identifier,targetDistance);

				}
				
				this.trace("----- Process_Ajax_return Done<br />");

				if(this.arrAjaxStack.length > 0 && !this.booLocked){
					this.Perform_Ajax();
				}else{  
					this.booReady = true;
				}	
				
			}
			
			this.Perform_Callbacks = function (identifier, distance){
				
				if(!distance){
					if(this.objDistance.hasOwnProperty(identifier)){
						distance = this.objDistance[identifier];
					}else{
						return false;
					}
				}
				
				var myCallBack;
                                
                                if(!this.objCallbackOverride.hasOwnProperty(identifier))
                                        return true;

				while(this.objCallbackOverride[identifier].length > 0){
					
					myCallBack = this.objCallbackOverride[identifier].shift();;
					myCallBack(identifier, distance);
				}
				
				return true;
			
			}
			
			this.trace = function (output,override){
				if(this.DEBUG || override)
					$("span").append("<br />"+output);
			}
			
		}
		
		
	</script>
</body>
</html>
