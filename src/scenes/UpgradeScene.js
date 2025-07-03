<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">
    <title>BombDrop</title>
    <style>
        /* Reset CSS: Please avoid making changes here unless you know what you're doing :) */
        *,
        *::before,
        *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden; /* Prevent scrolling on mobile */
        }

        body {
            line-height: 1;
            font-family: Arial, sans-serif;
            background-color: #040218;
        }
        
        /* Game container takes full screen */
        #game-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #040218;
        }
        
        /* Canvas fills the container */
        #game-container canvas {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            display: block !important;
            background-color: #040218 !important;
        }
        
        /* Mobile-specific adjustments */
        @media (max-width: 768px), (max-height: 768px) {
            html, body {
                width: 100%;
                height: 100vh;
                height: 100dvh; /* Use dynamic viewport height for mobile */
                margin: 0;
                padding: 0;
                overflow: hidden;
                position: fixed;
                background-color: #040218;
                touch-action: manipulation;
                -webkit-overflow-scrolling: touch;
                -webkit-user-select: none;
                user-select: none;
                display: flex;
                flex-direction: column;
            }
            
            #game-container {
                width: 100vw;
                flex: 1;
                min-height: 0;
                position: relative;
                background-color: #040218;
                display: flex;
                align-items: stretch;
                justify-content: stretch;
            }
            
            /* Mobile game canvas - fills entire game area */
            #game-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-width: none !important;
                max-height: none !important;
                display: block !important;
                background-color: #040218 !important;
            }
            
            /* Hide address bar on mobile browsers */
            @supports (-webkit-touch-callout: none) {
                html, body {
                    height: -webkit-fill-available;
                }
            }
        }
        
        /* Mobile Controller UI - only appears on mobile */
        .mobile-controller {
            display: none;
        }
        
        @media (max-width: 768px), (max-height: 768px) {
            .mobile-controller {
                display: none; /* Hidden by default */
                width: 100vw;
                height: 160px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
                border-top: 3px solid #4a5568;
                padding: 10px 15px;
                box-sizing: border-box;
                justify-content: space-between;
                align-items: center;
                position: relative;
                box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.5);
                flex-shrink: 0;
            }
            
            /* Show controller only during gameplay */
            .mobile-controller.game-active {
                display: flex;
            }
            
            /* Left side controls */
            .controller-left {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                flex: 1;
            }
            
            /* Movement buttons container */
            .movement-controls {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 3px;
                width: 140px;
                height: 90px;
                position: relative;
            }
            
            /* D-pad center piece */
            .movement-controls::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 45px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #2d3748, #1a202c);
                border-radius: 6px;
                z-index: 1;
                box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            
            /* D-pad horizontal bar */
            .movement-controls::after {
                content: '';
                position: absolute;
                top: 32px;
                left: 20px;
                width: 100px;
                height: 26px;
                background: linear-gradient(135deg, #2d3748, #1a202c);
                border-radius: 6px;
                z-index: 1;
                box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            
            /* Right side controls */
            .controller-right {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                flex: 1;
            }
            
            /* Action buttons container */
            .action-controls {
                display: flex;
                gap: 8px;
                align-items: center;
                flex-wrap: nowrap;
                justify-content: center;
            }
            
            /* Base button styling */
            .control-btn {
                border: none;
                border-radius: 50%;
                color: white;
                font-weight: bold;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                border: 3px solid rgba(255, 255, 255, 0.2);
                font-family: Arial, sans-serif;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                line-height: 1;
            }
            
            /* Movement buttons - D-pad style */
            .move-btn {
                width: 50px;
                height: 40px;
                background: linear-gradient(135deg, #4a90e2, #357abd);
                font-size: 18px;
                border-radius: 6px;
                z-index: 2;
                position: relative;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            /* Left button positioning */
            #move-left {
                grid-column: 1;
                grid-row: 1;
                border-radius: 6px 0 0 6px;
            }
            
            /* Down button positioning */
            #fast-fall {
                grid-column: 2;
                grid-row: 2;
                width: 45px;
                height: 40px;
                border-radius: 0 0 6px 6px;
            }
            
            /* Right button positioning */
            #move-right {
                grid-column: 3;
                grid-row: 1;
                border-radius: 0 6px 6px 0;
            }
            
            /* Jump button - larger */
            .jump-btn {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #50c878, #3da55c);
                font-size: 28px;
            }
            
            /* Special ability buttons */
            .ability-btn {
                width: 50px;
                height: 50px;
                font-size: 14px;
                position: relative;
            }
            
            .fast-fall-btn {
                background: linear-gradient(135deg, #ff6b6b, #e55353);
            }
            
            /* Fast fall button - matches movement buttons when unlocked */
            .fast-fall-btn:not(:disabled) {
                background: linear-gradient(135deg, #4a90e2, #357abd);
            }
            
            .barrier-btn {
                background: linear-gradient(135deg, #9b59b6, #8e44ad);
            }
            
            .emp-btn {
                background: linear-gradient(135deg, #f39c12, #e67e22);
            }
            
            .sonic-btn {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
            }
            
            /* Button hover/active states */
            .control-btn:active {
                transform: scale(0.9);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            }
            
            /* Disabled button styling */
            .control-btn:disabled {
                opacity: 0.5;
                background: linear-gradient(135deg, #666, #555);
                cursor: not-allowed;
            }
        }

        ol, ul {
            list-style: none;
        }

        img, video {
            max-width: 100%;
            height: auto;
            display: block;
        }

        a {
            text-decoration: none;
            color: inherit;
        }
    </style>
</head>
<body>
    <div id="game-container"></div>
    
    <!-- Mobile Controller - only visible on mobile devices -->
    <div class="mobile-controller">
        <!-- Left Side - Movement Controls -->
        <div class="controller-left">
            <div class="movement-controls">
                <button class="control-btn move-btn" id="move-left">←</button>
                <button class="control-btn move-btn fast-fall-btn" id="fast-fall" disabled>
                    ↓
                </button>
                <button class="control-btn move-btn" id="move-right">→</button>
            </div>
        </div>
        
        <!-- Right Side - Action Controls -->
        <div class="controller-right">
            <div class="action-controls">
                <button class="control-btn jump-btn" id="jump">↑</button>
            </div>
            
            <!-- All power-ups below jump -->
            <div class="action-controls">
                <button class="control-btn ability-btn barrier-btn" id="barrier" disabled>
                    🛡️
                </button>
                <button class="control-btn ability-btn emp-btn" id="emp" disabled>
                    ⚡
                </button>
                <button class="control-btn ability-btn sonic-btn" id="sonic" disabled>
                    🔊
                </button>
            </div>
        </div>
    </div>

    <script>
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
    </script>
    <script src="./phaser.js"></script>
    <script type="module" src="./src/main.js"></script>
</body>
</html>