/**
 * Menu Loader - Dynamically injects the menu HTML into pages
 * Let main.js handle all the jQuery initialization
 */

function loadMenu() {
	// Get the current pathname
	const currentPath = window.location.pathname;
	
	// Split by '/' and filter empty strings
	const parts = currentPath.split('/').filter(Boolean);
	
	// Calculate depth
	const depth = parts.length - 1;
	
	// Build the base path
	let basePath = '';
	for (let i = 0; i < depth; i++) {
		basePath += '../';
	}
	
	console.log('Menu Loader - Loading from:', basePath + 'assets/includes/menu.html');
	
	// Fetch the menu template
	fetch(basePath + 'assets/includes/menu.html')
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.text();
		})
		.then(html => {
			console.log('Menu Loader - HTML fetched, length:', html.length);
			
			// Replace {BASEPATH} placeholder with actual base path
			html = html.replace(/{BASEPATH}/g, basePath);
			
			// Insert the menu into the wrapper
			const wrapper = document.getElementById('wrapper');
			
			if (wrapper) {
				// Create a temporary container for the fetched HTML
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = html;
				
				// Extract header and menu nav specifically
				const header = tempDiv.querySelector('header');
				const menuNav = tempDiv.querySelector('nav#menu');
				
				if (header && menuNav) {
					// Insert header at the beginning of wrapper
					wrapper.insertBefore(header, wrapper.firstChild);
					
					// Insert menu nav after header
					wrapper.insertBefore(menuNav, wrapper.children[1]);
					
					console.log('Menu Loader - Menu injected successfully');
					
					// Signal to main.js that menu is ready
					// We need to wait for jQuery and then re-init
					waitForjQueryAndReinitMenu();
				} else {
					console.error('Menu Loader - Header or menu nav not found');
				}
			} else {
				console.error('Menu Loader - Wrapper not found');
			}
		})
		.catch(error => console.error('Menu Loader - Error:', error));
}

/**
 * Wait for jQuery to load and reinitialize the menu
 */
function waitForjQueryAndReinitMenu() {
	if (typeof jQuery === 'undefined') {
		// jQuery not loaded yet, wait
		console.log('Menu Loader - Waiting for jQuery...');
		setTimeout(waitForjQueryAndReinitMenu, 50);
		return;
	}
	
	console.log('Menu Loader - jQuery available, reinitializing menu');
	
	var $ = jQuery;
	var $menu = $('#menu');
	var $body = $('body');
	
	if ($menu.length === 0) {
		console.error('Menu Loader - Menu element not found after jQuery loaded');
		return;
	}
	
	console.log('Menu Loader - Found menu element, setting up handlers');
	
	// Wrap inner if not already wrapped
	if ($menu.find('> .inner').length === 0) {
		$menu.wrapInner('<div class="inner"></div>');
	}
	
	// Set up the lock/show/hide/toggle functions (matching main.js pattern)
	if (!$menu._locked) {
		$menu._locked = false;
		
		$menu._lock = function() {
			if ($menu._locked)
				return false;
			$menu._locked = true;
			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);
			return true;
		};
		
		$menu._show = function() {
			if ($menu._lock())
				$body.addClass('is-menu-visible');
		};
		
		$menu._hide = function() {
			if ($menu._lock())
				$body.removeClass('is-menu-visible');
		};
		
		$menu._toggle = function() {
			if ($menu._lock())
				$body.toggleClass('is-menu-visible');
		};
		
		// Set up click handlers
		$('a[href="#menu"]').on('click', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$menu._toggle();
		});
		
		$menu
			.appendTo($body)
			.on('click', function(event) {
				event.stopPropagation();
			})
			.on('click', 'a', function(event) {
				var href = $(this).attr('href');
				event.preventDefault();
				event.stopPropagation();
				$menu._hide();
				if (href != '#menu') {
					window.setTimeout(function() {
						window.location.href = href;
					}, 350);
				}
			});
		
		$body
			.on('click', function(event) {
				$menu._hide();
			})
			.on('keydown', function(event) {
				if (event.keyCode == 27)
					$menu._hide();
			});
	}
	
	console.log('Menu Loader - Menu reinitialization complete');
}

// Load menu when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', loadMenu);
} else {
	loadMenu();
}
