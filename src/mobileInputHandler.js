export class MobileInputHandler {
    constructor(scene) {
        this.scene = scene;
        this.inputs = {
            moveLeft: false,
            moveRight: false,
            jump: false,
            fastFall: false
        };
        
        this.setupInputListeners();
    }
    
    setupInputListeners() {
        // Listen for mobile input events
        this.scene.input.on('mobileInput', this.handleMobileInput, this);
        
        // Also listen to window events as backup
        window.addEventListener('mobileInput', (event) => {
            this.handleMobileInput(event.detail.action, event.detail.pressed);
        });
    }
    
    handleMobileInput(action, pressed) {
        console.log('Handling mobile input:', action, pressed);
        
        // Update input state
        if (this.inputs.hasOwnProperty(action)) {
            this.inputs[action] = pressed;
        }
        
        // Handle specific actions
        switch (action) {
            case 'jump':
                if (pressed && this.scene.player && this.scene.player.body.touching.down) {
                    this.scene.player.setVelocityY(-330);
                }
                break;
                
            case 'barrier':
                if (pressed && this.scene.activateBarrier) {
                    this.scene.activateBarrier();
                }
                break;
                
            case 'emp':
                if (pressed && this.scene.activateEMP) {
                    this.scene.activateEMP();
                }
                break;
                
            case 'sonic':
                if (pressed && this.scene.activateSonicBoom) {
                    this.scene.activateSonicBoom();
                }
                break;
        }
    }
    
    update() {
        if (!this.scene.player) return;
        
        // Handle continuous movement
        if (this.inputs.moveLeft && this.scene.player.body.touching.down) {
            this.scene.player.setVelocityX(-160);
        } else if (this.inputs.moveRight && this.scene.player.body.touching.down) {
            this.scene.player.setVelocityX(160);
        }
        
        // Handle fast fall
        if (this.inputs.fastFall && this.scene.player.body.velocity.y > 0) {
            this.scene.player.setVelocityY(this.scene.player.body.velocity.y + 20);
        }
    }
    
    destroy() {
        this.scene.input.off('mobileInput', this.handleMobileInput, this);
        window.removeEventListener('mobileInput', this.handleMobileInput);
    }
}
