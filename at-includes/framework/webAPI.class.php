<?php

	/*
		// Initiate New webAPI instance
		$webAPI = new webAPI();
		
		// call a Page
		$webAPI->request("http://www.google.com/");
	*/
	
	class webAPI {
		
		private $error;
		
		/****************************************
			Name:	Request - Calls a webpage by URL
			Returns:obj->ResponseData
			Usage:
				webAPI->request(url[,options])
				
				# Options
					// Submit Post data to URL
					$options['postdata']		= "var=val&message=Hi! This is a test!";
					
					// Set authentication information
					$options['authentication']	= "user:pass";
					
					// Set referring URL
					$options['referringurl']	= "http://www.google.com/";
					
					// Set User Agent
					$options['useragent']		= "Mozilla/5.0 (Macintosh; CURL webAPI; en-US)";
					
					// Only send one way (Don't return loaded data)
					$options['oneway']			= TRUE;
					
		****************************************/
		function request( $url, $options=array() ) {
			$ch = curl_init();  
			error_log('Try: '.$url);
			
			# REQUIRED
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
			
			# OPTIONS
			// Authentication
			if( isset($options['authentication']) )
				curl_setopt($ch, CURLOPT_USERPWD, $options['authentication']);
				
			if( !isset($options['oneway']) || (isset($options['oneway']) && !$options['oneway']) )
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
			
			// UserAgent
			if ( isset($options['useragent']) )
				curl_setopt($ch, CURLOPT_USERAGENT, $options['useragent']);
				
			// Referring URL
			if ( isset($options['referringurl']) )
				curl_setopt($ch, CURLOPT_REFERER, $options['referringurl']);
			
			// PostData
			if ( isset($options['postdata']) ) {
				curl_setopt($ch, CURLOPT_POST, 1); 
				curl_setopt($ch, CURLOPT_POSTFIELDS, $post); 
			}
			
			# OTHER
			// Force Accept SSL Certs, even if invalid
			if(preg_match("/^(https)/",$url)){
				curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,false);
			}
	
			# CALL PAGE
			$result = curl_exec ($ch);
			
			# CLOSE CURL
			curl_close ($ch);
			
			// Simple XML
			if ( $result ) {
				$xml    = FALSE;
				if ( isset($options['parseXML']) && $options['parseXML'] ) {
					libxml_use_internal_errors(true);
					$sxe = simplexml_load_string($result);
					if($sxe){
						$xml=$sxe;
					}else{
						$xml=FALSE;
					}
				}
			}
			else{
				$result	= FALSE;
				$xml	= FALSE;
			}
			error_log('Try: '.$url);
			# FORMAT & RETURN
			$ret = (object)"";
			$ret->RequestURL		= $url;
			$ret->ResponseData		= ( ( $result ) ? $result : FALSE);
			$ret->ResponseXML		= $xml;
			
			return ( ( isset($options['parseXML']) && $options['parseXML'] ) ? $ret->ResponseXML : $ret->ResponseData );
		}
	
		/****************************************
			Name:	RequestXML - Parses returned data from URL to XML string
			Returns:obj->ResponseData
					obj->ResponseXML
					obj->RequestURL
			Usage:
				webAPI->requestXML(url[,options])
				
				# Options
					Same as webAPI->request
					
		****************************************/
		function requestXML( $url, $options=array() ){
			$options["parseXML"] = 1;
			return $this->request($url,$options);
		}
	
		/****************************************
			Name:	SaveRemoteFile - Saves a file from a server to the local file system
			Returns:SavePath/FALSE (webAPI->getLastError() for more info)
			Usage:
				webAPI->saveRemoteFile(SourceURL,DestLocation)
					
		****************************************/
		function saveRemoteFile($url,$saveto,$overwrite=FALSE) {
			$error = array();
			
			$request = $this->request($url);
			$file_name = substr($request->responseURL, strrpos($request->responseURL, "/") + 1);
			$saveto=( (substr($saveto, 0, strlen($saveto) - 1) == "/") ? $saveto : $saveto .'/');
			
			// Find problems before they start!
			if(!$request->responseData)
				$error[] = "No data was returned from URL?";
				
			if ( !file_exists($saveto) )
				$error[]="Saveto directory does not exist. Please create it and try again.";
				
			if(file_exists($saveto.$file_name)&&!$overwrite)
				$error[]="Destination file `$file_name` already Exists. To overwrite existing files, call saveRemoteFile(URL,SaveToDirectory,Overwrite) again with the `Overwrite` flag set to 1.";
			
			if(file_exists($saveto) && !is_writeable($saveto))
				$error[]="Saveto directory `$saveto` is not writable. Please set permissions to at least 766 and try again.";
			
			
			// We good? Save it!
			if(count($error)==0){
				if (!$handle = fopen($saveto.$file_name, 'w')) {
					 $error[]="Cannot open `$file_name`. Check permissions and try again.";
				}
				
				if (fwrite($handle, $request->responseData) === FALSE) {
					$error[]="Cannot write to file `$file_name`. Check permissions and try again.";
				}
				
				fclose($handle);
				
				if(count($error)==0){
					return $saveto.$file_name;
				}
				else{
					$this->error = $error[0];
					return FALSE;
				}
			}
		}
		
		
		# BETWEEN
		#		Returns the value between two provided characters/strings
		# Returns STR
		function between ( $string, $char1, $char2 ) {
			$string = substr( $string, stripos( $string, $char1 ) + strlen( $char1 ) );
			$string = substr( $string, 0, stripos( $string, $char2 ) );
			return $string;
		}
		
		
		# CONTAINS
		#		Returns TRUE if the string contains a particular word
		# Returns Bool
		function contains ( $hay, $needle ) {
			return ( strpos(" ". $hay, $needle)>0 ) ? true : false;
		}
	}
?>