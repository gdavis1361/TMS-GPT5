<?php

$dashboardItems = array(
	'text' => 'Dashboard',
	'href' => '/',
	'cls' => 'Delicious',
	'section' => 'dashboard',
	'items' => array(
		array(
			'text' => 'Tasks',
			'href' => '/',
			'page' => 'my list'
		),
		array(
			'text' => 'Calendar',
			'href' => '/calendar',
			'page' => 'calendar'
		)
	)
);

$contactItems = array(
	'text' => 'Contacts',
	'href' => '/contacts',
	'cls' => 'Delicious',
	'section' => 'contacts',
	'items' => array(
		array(
			'text' => 'Add',
			'href' => '/contacts/?d=contacts&a=add',
			'page' => 'add'
		),
		array(
			'text' => 'My Contacts',
			'href' => '/contacts/',
			'page' => 'contacts'
		),
		array(
			'text' => 'Free Agents',
			'href' => '/contacts/?d=contacts&a=free_agents',
			'page' => 'free agents'
		),
		array(
			'text' => 'Carriers',
			'href' => '/carriers/',
			'page' => 'carriers'
		),
		array(
			'text' => 'Customers',
			'href' => '/customers/',
			'page' => 'customers'
		)
	)
);

$orderItems = array(
	'text' => 'Orders',
	'href' => '/orders',
	'cls' => 'Delicious',
	'section' => 'orders',
	'items' => array(
		array(
			'text' => 'Add',
			'href' => '/orders/?d=quotes&a=add',
			'page' => 'add'
		),
		/*
		array(
			'text' => 'Posts',
			'href' => '/orders/?d=posts',
			'page' => 'posts'
		),
		*/
		array(
			'text' => 'Quotes',
			'href' => '/orders/?d=quotes',
			'page' => 'quotes'
		),
		array(
			'text' => 'Orders',
			'href' => '/orders/',
			'page' => 'orders'
		)
	)
);

$myPageItems = array(
	'text' => 'My Page',
	'href' => '/mypage',
	'cls' => 'Delicious',
	'section' => 'my page',
	'items' => array(
		array(
			'text' => 'Home',
			'href' => '/mypage/',
			'page' => 'home'
		),
		array(
			'text' => 'Stats',
			'href' => '/mypage/?section=stats',
			'page' => 'stats'
		),
		array(
			'text' => 'Scores',
			'href' => '/mypage/?section=scores',
			'page' => 'scores'
		),
		array(
			'text' => 'Teams',
			'href' => '/mypage/?section=teams',
			'page' => 'teams'
		),
		array(
			'text' => 'Standings',
			'href' => '/mypage/?section=standings',
			'page' => 'standings'
		),

	)
);

$adminItems = array(
	'text' => 'Admin',
	'href' => '/admin',
	'cls' => 'Delicious',
	'section' => 'admin',
	'items' => array(
		array(
			'text' => 'Contact Types',
			'href' => '/admin/?page=contact%20types',
			'page' => 'contact types'
		),
		array(
			'text' => 'Docs',
			'href' => '/admin/?page=docs',
			'page' => 'docs'
		),
		array(
			'text' => 'Points',
			'href' => '/admin/?page=points',
			'page' => 'points'
		),
		array(
			'text' => 'Roles',
			'href' => '/admin/?page=roles',
			'page' => 'roles'
		),
		array(
			'text' => 'Tasks',
			'href' => '/admin/?page=tasks',
			'page' => 'tasks'
		),
		array(
			'text' => 'Teams',
			'href' => '/admin/?page=teams',
			'page' => 'teams'
		),
		array(
			'text' => 'Users',
			'href' => '/admin/?page=users',
			'page' => 'users'
		)
	)
);

$oSession = $GLOBALS['oSession'];
$roleId = $oSession->session_var('role_id');

$navigationItems = array(
	$dashboardItems
);

$contactRoles = array(
	UserRoles::Admin,
	UserRoles::Broker,
	UserRoles::PodLoader,
	UserRoles::CarrierPayables, // contact list for carrier link
	UserRoles::CreditAndCollections
);
if (in_array($roleId, $contactRoles)) {
	$navigationItems[] = $contactItems;
}

$orderRoles = array(
	UserRoles::Admin,
	UserRoles::Broker,
	UserRoles::PodLoader,
	UserRoles::CarrierPayables
);
if (in_array($roleId, $orderRoles)) {
	$navigationItems[] = $orderItems;
}


$navigationItems[] = $myPageItems;

if ($roleId == 1) {
	$navigationItems[] = $adminItems;
}