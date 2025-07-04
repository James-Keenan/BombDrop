// Enhanced mobile detection
function detectMobile() {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
    const hasOrientation = typeof window.orientation !== "undefined";
    
    return isMobileUA || hasOrientation || (hasTouch && isSmallScreen);
}

// Global functions for game scene communication
window.showMobileController = function() {
    if (detectMobile()) {
        const controller = document.querySelector('.mobile-controller');
        if (controller) {
            controller.classList.add('game-active');
            console.log('Mobile controller shown');
            // Ensure controllers are set up when shown
            setupMobileControllers();
        }
    }
};

window.hideMobileController = function() {
    const controller = document.querySelector('.mobile-controller');
    if (controller) {
        controller.classList.remove('game-active');
        console.log('Mobile controller hidden');
    }
};

function setupMobileLayout() {
    if (detectMobile()) {
        console.log('Mobile device detected - setting up mobile layout');
        document.body.classList.add('mobile-device');
        
        // Setup mobile controllers immediately
        setupMobileControllers();
        
        // Prevent zoom on double tap
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // Prevent context menu and text selection
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
        
        document.addEventListener('selectstart', function(event) {
            event.preventDefault();
        });
    } else {
        console.log('Desktop device detected');
        document.body.classList.remove('mobile-device');
    }
}

// Set up mobile layout immediately
setupMobileLayout();

// Handle orientation and resize changes
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        setupMobileLayout();
        // Force viewport refresh
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 1);
    }, 100);
});

window.addEventListener('resize', function() {
    setTimeout(setupMobileLayout, 100);
});

// Force mobile layout setup after page load
window.addEventListener('load', function() {
    setupMobileLayout();
    // Hide address bar on iOS
    setTimeout(() => {
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 1);
    }, 500);
});

document.addEventListener('DOMContentLoaded', setupMobileLayout);

// Mobile Controller Button Event Handlers
function setupMobileControllers() {
    if (!detectMobile()) return;
    
    console.log('Setting up mobile controllers...');
    
    const moveLeftBtn = document.getElementById('move-left');
    const moveRightBtn = document.getElementById('move-right');
    const jumpBtn = document.getElementById('jump');
    const fastFallBtn = document.getElementById('fast-fall');
    const barrierBtn = document.getElementById('barrier');
    const empBtn = document.getElementById('emp');
    const sonicBtn = document.getElementById('sonic');
    
    if (!moveLeftBtn || !moveRightBtn || !jumpBtn) {
        console.log('Mobile controller buttons not found');
        return;
    }
    
    // Remove existing event listeners to prevent duplicates
    moveLeftBtn.replaceWith(moveLeftBtn.cloneNode(true));
    moveRightBtn.replaceWith(moveRightBtn.cloneNode(true));
    jumpBtn.replaceWith(jumpBtn.cloneNode(true));
    fastFallBtn.replaceWith(fastFallBtn.cloneNode(true));
    barrierBtn.replaceWith(barrierBtn.cloneNode(true));
    empBtn.replaceWith(empBtn.cloneNode(true));
    sonicBtn.replaceWith(sonicBtn.cloneNode(true));
    
    // Get fresh references after cloning
    const newMoveLeftBtn = document.getElementById('move-left');
    const newMoveRightBtn = document.getElementById('move-right');
    const newJumpBtn = document.getElementById('jump');
    const newFastFallBtn = document.getElementById('fast-fall');
    const newBarrierBtn = document.getElementById('barrier');
    const newEmpBtn = document.getElementById('emp');
    const newSonicBtn = document.getElementById('sonic');
    
    // Create keyboard event simulator
    function createKeyEvent(type, keyCode) {
        return new KeyboardEvent(type, {
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });
    }
    
    // Setup movement buttons
    function setupMovementButton(button, keyCode, direction) {
        if (!button) return;
        
        let isPressed = false;
        
        const start = (e) => {
            e.preventDefault();
            if (button.disabled || isPressed) return;
            
            isPressed = true;
            button.style.transform = 'scale(0.9)';
            document.dispatchEvent(createKeyEvent('keydown', keyCode));
            console.log(`${direction} button pressed`);
        };
        
        const end = (e) => {
            e.preventDefault();
            if (!isPressed) return;
            
            isPressed = false;
            button.style.transform = 'scale(1)';
            document.dispatchEvent(createKeyEvent('keyup', keyCode));
            console.log(`${direction} button released`);
        };
        
        button.addEventListener('touchstart', start, { passive: false });
        button.addEventListener('touchend', end, { passive: false });
        button.addEventListener('touchcancel', end, { passive: false });
        button.addEventListener('mousedown', start);
        button.addEventListener('mouseup', end);
        button.addEventListener('mouseleave', end);
    }
    
    // Setup action buttons (single press)
    function setupActionButton(button, keyCode, actionName) {
        if (!button) return;
        
        const action = (e) => {
            e.preventDefault();
            if (button.disabled) return;
            
            button.style.transform = 'scale(0.9)';
            document.dispatchEvent(createKeyEvent('keydown', keyCode));
            
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                document.dispatchEvent(createKeyEvent('keyup', keyCode));
            }, 100);
            
            console.log(`${actionName} activated`);
        };
        
        button.addEventListener('touchstart', action, { passive: false });
        button.addEventListener('mousedown', action);
    }
    
    // Map buttons to keyboard keys
    setupMovementButton(newMoveLeftBtn, 37, 'Left');     // Left arrow
    setupMovementButton(newMoveRightBtn, 39, 'Right');   // Right arrow
    setupActionButton(newJumpBtn, 38, 'Jump');           // Up arrow
    setupActionButton(newFastFallBtn, 40, 'Fast Fall');  // Down arrow
    setupActionButton(newBarrierBtn, 32, 'Barrier');     // Space
    setupActionButton(newEmpBtn, 69, 'EMP');             // E key
    setupActionButton(newSonicBtn, 81, 'Sonic');         // Q key
    
    console.log('Mobile controllers setup complete');
    
    // Update button states based on level
    window.updateMobileButtons = function(gameLevel) {
        console.log('Updating mobile buttons for level:', gameLevel);
        
        if (gameLevel >= 3 && newFastFallBtn) {
            newFastFallBtn.disabled = false;
            newFastFallBtn.style.opacity = '1';
        }
        
        if (gameLevel >= 4 && newEmpBtn) {
            newEmpBtn.disabled = false;
            newEmpBtn.style.opacity = '1';
        }
        
        if (gameLevel >= 5 && newBarrierBtn) {
            newBarrierBtn.disabled = false;
            newBarrierBtn.style.opacity = '1';
        }
        
        if (gameLevel >= 6 && newSonicBtn) {
            newSonicBtn.disabled = false;
            newSonicBtn.style.opacity = '1';
        }
    };
}

// Auto-show controller for testing on mobile
window.addEventListener('load', function() {
    setTimeout(function() {
        if (detectMobile()) {
            console.log('Auto-showing mobile controller for testing...');
            window.showMobileController();
        }
    }, 3000);
});