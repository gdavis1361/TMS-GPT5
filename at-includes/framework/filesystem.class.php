<?php
/*
$aFiles = new filesystem('/');
*/
class filesystem {

	private $m_aFiles = array();

	function __construct( $dir, $isRecursive = FALSE ){
		$this->get_directory( $dir, $isRecursive );
	}
	
	function get_directory( $path = '.', $isRecursive = TRUE, $level = 0 ){ 
		$aFiles = array();
		$ignore = array( '.', '..' ); 
		$dh = @opendir( $path );
		
		while( false !== ( $file = readdir( $dh ) ) ){
			if( !in_array( $file, $ignore ) ){
				$spaces = str_repeat( '&nbsp;', ( $level * 4 ) );
				if( is_dir( "$path/$file" ) && $isRecursive ){
					$aTmp = $this->get_directory( "$path/$file", $isRecursive, ($level+1) );
					$aFiles = array_merge($aFiles,$aTmp);
				} else {
					if ( $isRecursive ) {
						$aFiles[] = "$path/$file";
					} 
					else {
						$aFiles[] = "$file";
					}
				}
				
			}
			
		}
		closedir( $dh );
		$this->m_aFiles = $aFiles;
		return $aFiles;
	}
	
	function files(){
		return $this->m_aFiles;
	}
}
?>