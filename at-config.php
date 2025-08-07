<?php
/*
*  Database Credentials
*************************/
       $_DB['TMS']['DB_TYPE']     = 'mssql';
       $_DB['TMS']['DB_HOST']     = '184.106.79.198';
	   
	   //Production Server
	   if(ENVIRONMENT == 'production'){
			$_DB['TMS']['DB_HOST']	= '192.168.10.115';
	   }
	   
       $_DB['TMS']['DB_USERNAME'] = 'tmsuser';
       $_DB['TMS']['DB_PASSWORD'] = 'B9d7Cfj7GFrrtvJ2qmJXMaHf';
       $_DB['TMS']['DB_DATABASE'] = 'TMS';
       $_DB['TMS']['DB_SCHEMA']   = 'dbo';
       
       $_DB['TMS']['DB_TABLEPREFIX'] = ''; 


/*
*  Other Services
*************************/
       // 3rd Party Services ( Accessible VIA `config('SERVICE_USERNAME')` function )
       $_CONFIG['SERVICE_USERNAME']     = '';
       $_CONFIG['SERVICE_PASSWORD']     = '';

/*
*  Default Site Config
*************************/

       // Session Defaults
       $_CONFIG_DEFAULTS['SESSION_LENGTH']        = ( 60 * 60 * 24 * 7 );
       $_CONFIG_DEFAULTS['SESSION_RECORD_LENGTH'] = ( 60 * 60 * 24 * 5 );
       date_default_timezone_set( "America/New_York" );
	   