/**
 * Menu Loader - Dynamically injects the menu HTML into pages
 * Handles both local development and GitHub Pages deployment
 */

function loadMenu() {
	const currentPath = window.location.pathname;
	
	// Detect if we're on GitHub Pages (cookie-shruthi.github.io/portfolio)
	// or local development (localhost:8000)
	let basePath = '';
	let menuPath = '';
	
	if (currentPath.includes('/portfolio/')) {
		// GitHub Pages deployment
		const match = currentPath.match(/\/portfolio\/(.*)/);
		const pathAfterPortfolio = match ? match[1] : '';
		const depth = pathAfterPortfolio.split('/').filter(Boolean).length - 1;
		
		// Build relative path back to portfolio root
		basePath = '';
		for (let i = 0; i < depth; i++) {
			basePath += '../';
		}
		
		// But menu path is relative to portfolio root
		menuPath = basePath + 'assets/includes/menu.html';
		
		console.log('Menu Loader - GitHub Pages mode. Path after portfolio:', pathAfterPortfolio, 'Depth:', depth, 'BasePath:', basePath);
	} else {
		// Local development
		const parts = currentPath.split('/').filter(Boolean);
		const depth = parts.length - 1;
		
		basePath = '';
		for (let i = 0; i < depth; i++) {
			basePath += '../';
		}
		
		menuPath = basePath + 'assets/includes/menu.html';
		console.log('Menu Loader - Local mode. Path:', currentPath, 'Depth:', depth, 'BasePath:', basePath);
	}
	
	console.log('Menu Loader - Fetching menu from:', menuPath);
	
	// Fetch the menu template
	fetch(menuPath)
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
