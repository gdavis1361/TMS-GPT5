<!--page = loads.php-->
<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');

require_once($_SERVER['DOCUMENT_ROOT'] . '/at-extend/LoadBase.php');

// more of a model and controller
// includes the view in display()
class loadsController {
	
	protected $sAction = null;
	
	protected $sDisplay = null;
	
	// needed for createNewLoad
	protected $nUserId = null;
	
	// needed for createNewLoad
	protected $sUserName = null;
	
	// needed for createNewLoad
	protected $nOrderId = null;
	
	// needed for createNewLoad
	protected $nCarrierId = null;
	
	// needed for createNewLoad
	protected $nTeamUsed = null;
	
	// needed for createNewLoad
	protected $nPowerUnitId = null;
	
	// needed for createNewLoad
	protected $nEquipmentId = null;
	
	// needed for createNewLoad
	protected $sEquipmentUsed = null;
	
	// needed for createNewLoad
	protected $nModeId = null;
	
	// needed for createMovement
	protected $nMovementId = null;
	
	// needed for setViewOutput
	protected $sCustomerName = null;
	
	// needed for display()
	protected $data = array();

	// receives a user_id
    public function __construct($user_id)
    {
    	//parent::__construct();
    	
    	//$this->_msDelete('426'); exit;
        
    	$this->nUserId = $user_id;
    	
    	// set the _REQUEST[] params
	    $this->setParams();
    }

    protected function setParams()
    {
	    $this->sAction = request('a', request('action', '') ) ;
        $this->sDisplay = request('d', request('display', 'list') ) ;
        $this->nOrderId = request('id');
        $this->nCarrierId = request('cid');
    }
    
    public function _init()
    {
    	switch($this->sDisplay) 
    	{
            case "add":
            	
            	$this->createNewLoad();
            	
            	$this->display();
            	
            default:
            	
                $this->createNewLoad();
            	
            	$this->display();
            	
            break;
    	}     
    }
    
    protected function createNewLoad()
    { 
    	// set the $oOrder obj 
        $this->setOrder();
             
        $this->setOrderMode();

        $this->setOrderEquipmentAllowed();

        // set the $oLoad obj
        $this->setLoad();
        
        $this->setLocation();
     
        $this->setCustomer();
                
        //sets stops array and stop_index
        $this->setStops(); 

        // set the $oGeoData obj
        $this->setGeoData();
        
        $this->setUserName();
        
        // set the $oOrderToMovement obj
        $this->setOrderToMovement();
        
        if(count($this->aStops) > 1) 
        {
            $this->setOrigin();
       
            $this->setDestination();
         
            $this->oLoad->create( 
                                 $this->nCarrierId, 
                                 $this->nTeamUsed, 
                                 $this->nPowerUnitId, 
                                 $this->nEquipmentId, 
                                 $this->nModeId, 
                                 $this->nUserId, 
                                 $this->nOrderId 
                                ); 
            
            $this->createMovement();
            
            $this->setViewOutput();
        
        }            
    }
    
    protected function setOrderToMovement()
    {
    	$this->oOrderToMovement = new OrderToMovement();
    }
    
    protected function createMovement()
    {
    	// update the order_to_movements table
    	$this->oOrderToMovement->create(
    	                                $this->nOrderId,      // order_id 
    	                                $this->nStopIndex,    // stop_index 
    	                                $this->nMovementId,   // movement_id 
    	                                $this->nUserId        // updated_by 
    	                                //'',                 // create_at 
    	                                //'',                 // updated_by 
    	                                //''                  // updated_at 
    	                               );
    }
    
    protected function setOrder()
    {
    	$this->oOrder = new OrderBase();
    	
    	$this->oOrder->load($this->nOrderId);
    	
    	$this->nTeamUsed = $this->oOrder->get('team_required');
    }
    
    protected function setLoad()
    {
    	$this->oLoad = new LoadBase();
    	
    	$this->nLoadId = $this->oLoad->get('load_id');
    }
    
    protected function setPowerUnit()
    {
    	$this->nPowerUnitId = '1';
    }
    
    protected function setLocation()
    {
    	$this->oLocation = new LocationBase();
    }
    
    protected function setCustomer()
    {
    	$this->oCustomer = $this->oOrder->get_customer();
    	
    	$this->sCustomerName = $this->oCustomer->get_customer_name();
    }
    
    // set an array of stops
    protected function setStops()
    {
    	$this->aStops = $aStops = $this->oOrder->get_stops();
    	
    	foreach(array_keys($aStops) as $key)
    	{
    	    $nStopIndex[] = $aStops[$key]->m_aLoadedValues['order_stops']['stop_index'];
    	}
    	$this->nStopIndex = $nStopIndex[0];
    	//echo $this->stopIndex = $this->aStops['stop_index'];
    }

    // set the GeoData Object
    protected function setGeoData()
    {
    	$this->oGeoData = new GeoData();
    }
    
    protected function setUserName()
    {
    	$oUserBase = new UserBase();
        
        $oUserBase->load($this->nUserId);
        
        $this->sUserName = $oUserBase->get_user_name();
    }
    
    protected function setOrigin()
    {
    	$oOrigin = array_shift($this->aStops);
    	
    	$this->Origin = $this->oLocation->get_zip($oOrigin->get('location_id'));
    	
    	$oOriginCityState = $this->oGeoData->lookup_zip($this->Origin);
    	
        $this->sOrigin = $oOriginCityState->City . ", " . $oOriginCityState->State . " (" . $this->Origin . ")";
        
        $this->nOriginId = $oOrigin->get('location_id');
    }
    
    protected function setDestination()
    {
    	$oDestination = array_pop($this->aStops);
    	
    	$this->Destination = $this->oLocation->get_zip($oDestination->get('location_id'));
    	
    	$oDestinationCityState = $this->oGeoData->lookup_zip($this->Destination);
            
    	$this->sDestination = $oDestinationCityState->City . ", " . $oDestinationCityState->State . " (" . $this->Destination . ")";
    	
    	$this->nDestinationId = $oDestination->get('location_id');
    }
    
    protected function setOrderMode()
    {
    	$oOrderMode = new OrderModesAllowed();
    	
        $oOrderMode->where('order_id', '=', $this->nOrderId);
                
        $aOrderMode = $oOrderMode->list()->rows;
        
        foreach($aOrderMode as $row)
        {
            $this->nModeId = $row->get('mode_id');
        }
    }
    
    protected function setOrderEquipmentAllowed()
    {
    	$oEquip = new OrderEquipmentAllowed();
    	
    	$oEquip->where('order_id', '=', $this->nOrderId);
                
        $aEquip = $oEquip->list()->rows;
        
        foreach($aEquip as $row) 
        {
            $this->nEquipmentId = $row->get('equipment_id');
        }

        // this does not work as there is no $equip['name']
        $this->aEquipment = $this->oOrder->get_equipment_allowed();
           
        $this->aEquipmentNames = array();
        
        if(!empty($this->aEquipment))
        {
           foreach ($this->aEquipment as $equip) 
           {
               $this->aEquipmentNames[] = $equip['name'];
           }
           $this->sEquipmentUsed = 'Equipment used: '.implode(", ", $this->aEquipmentNames).'<br />';
        }
    }
    
    protected function setViewOutput()
    {
    	$this->data['newLoadDetailsHeader'] = 'New Loads Details';
            
        $out = 'Successful load creation with id: '.$this->nUserId.'<br />';
        
        $out .= 'Customer Name: '.$this->sCustomerName.'<br />';
        
        $out .= 'Associated order id: '.$this->nOrderId.'<br />';
            
        
        $out .= $this->sEquipmentUsed;
              
            
        $out .= 'Load created with origin: '.$this->sOrigin.' and location id: '.$this->nOriginId.'<br />';
            
        $out .= 'Load created with destination: '.$this->sDestination.' and location id: '.$this->nDestinationId.'<br />';
            
        $out .= 'Created by user: '.$this->sUserName.'<hr />';
        
        $out .= 'Movement:<br />';
        
        $out .= 'Stop Index: '. $this->nStopIndex . '<br />';   // stop_index 
    	                         
        $out .= 'Movement Id: '. $this->nMovementId. '<br />';
            
        $this->data['newLoadDetails'] = $out;
    }
    
    private function display()
    {   
    	foreach($this->data as $key=>$val)
    	{
    		$$key = $val;
    	}
    	require_once($_SERVER['DOCUMENT_ROOT'] . '/orders/_list_loads_view.php');
    }
}

$loads = new loadsController($nUserId);
$loads->_init();
?>

