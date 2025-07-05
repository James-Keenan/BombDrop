// settings.js
// Professional settings UI overlay for BombDrop
// Exports a function to show the settings UI and handle username change

export function showSettings(scene, currentUsername, onUsernameChange) {
    // Only show the close button if NOT editing the username
    let closeBtn = null;
    function showCloseBtn() {
        if (closeBtn) return;
        closeBtn = scene.add.text(725, 570, 'Close', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ffd0', stroke: '#000', strokeThickness: 5, backgroundColor: '#e0f7fa', padding: { left: 18, right: 18, top: 8, bottom: 8 }
        })
            .setOrigin(0.5)
            .setDepth(202)
            .setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            closeBtn.disableInteractive().setAlpha(0.5);
            cleanup();
        });
    }
    // Only declare these once for the whole settings overlay
    let inputElem = null;
    let userLabel = null;
    let saveBtn = null;
    let cancelBtn = null;

    // Overlay background
    const overlay = scene.add.rectangle(725, 475, 600, 340, 0x001122, 0.98).setDepth(200);
    const panel = scene.add.rectangle(725, 475, 540, 260, 0xffffff, 0.98)
        .setStrokeStyle(5, 0x00ffd0)
        .setDepth(201);
    // Title
    const title = scene.add.text(725, 370, 'Settings', {
        fontFamily: 'Arial Black', fontSize: 38, color: '#00ffd0', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(202);

    // Change User Name button
    const changeBtn = scene.add.text(725, 470, 'Change User Name', {
        fontFamily: 'Arial Black', fontSize: 28, color: '#00ffd0', stroke: '#000', strokeThickness: 5, backgroundColor: '#e0f7fa', padding: { left: 18, right: 18, top: 8, bottom: 8 }
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    // Show input UI only when button is pressed
    function showInputBox() {
        if (closeBtn) { closeBtn.destroy(); closeBtn = null; }
        changeBtn.disableInteractive().setAlpha(0.5);
        userLabel = scene.add.text(725, 430, 'Enter New Username:', {
            fontFamily: 'Arial', fontSize: 26, color: '#333', stroke: '#00ffd0', strokeThickness: 2
        }).setOrigin(0.5).setDepth(202);
        inputElem = document.createElement('input');
        inputElem.type = 'text';
        inputElem.value = currentUsername || '';
        inputElem.maxLength = 16;
        inputElem.style.position = 'absolute';
        // Center input box over the settings panel
        const canvasRect = scene.sys.game.canvas.getBoundingClientRect();
        const inputWidth = 400;
        const inputHeight = 38;
        const centerX = canvasRect.left + canvasRect.width / 2;
        const centerY = canvasRect.top + canvasRect.height / 2;
        inputElem.style.left = (centerX - inputWidth / 2) + 'px';
        inputElem.style.top = (centerY - inputHeight / 2) + 'px';
        inputElem.style.width = inputWidth + 'px';
        inputElem.style.height = inputHeight + 'px';
        inputElem.style.fontSize = '24px';
        inputElem.style.fontFamily = 'Arial, sans-serif';
        inputElem.style.border = '2px solid #00ffd0';
        inputElem.style.borderRadius = '8px';
        inputElem.style.padding = '4px 12px';
        inputElem.style.background = '#f8faff';
        inputElem.style.color = '#222';
        inputElem.style.zIndex = 1000;
        document.body.appendChild(inputElem);
        inputElem.focus();
        saveBtn = scene.add.text(725, 530, 'Save', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ffd0', stroke: '#000', strokeThickness: 5, backgroundColor: '#e0f7fa'
        }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
        cancelBtn = scene.add.text(725, 580, 'Cancel', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ff4466', stroke: '#000', strokeThickness: 5, backgroundColor: '#fff0f3'
        }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
        saveBtn.on('pointerdown', () => {
            const newName = inputElem.value.trim();
            if (newName && newName.length > 0 && newName.length <= 16) {
                cleanup();
                if (onUsernameChange) onUsernameChange(newName);
            } else {
                inputElem.style.border = '2px solid #ff4466';
                inputElem.style.background = '#fff0f3';
            }
        });
        cancelBtn.on('pointerdown', () => {
            cleanup();
            showCloseBtn();
            changeBtn.setInteractive().setAlpha(1);
        });
        scene.input.keyboard.once('keydown-ESC', () => {
            cleanup();
            showCloseBtn();
            changeBtn.setInteractive().setAlpha(1);
        });
    }
    changeBtn.on('pointerdown', showInputBox);
    showCloseBtn();

    // Close/cancel logic
    function cleanup() {
        // Defensive: destroy all possible UI elements only once
        if (overlay && overlay.active && overlay.destroy) overlay.destroy();
        if (panel && panel.active && panel.destroy) panel.destroy();
        if (title && title.active && title.destroy) title.destroy();
        if (changeBtn && changeBtn.active && changeBtn.destroy) changeBtn.destroy();
        if (closeBtn && closeBtn.active && closeBtn.destroy) closeBtn.destroy();
        if (userLabel && userLabel.active && userLabel.destroy) userLabel.destroy();
        if (saveBtn && saveBtn.active && saveBtn.destroy) saveBtn.destroy();
        if (cancelBtn && cancelBtn.active && cancelBtn.destroy) cancelBtn.destroy();
        // Always remove the input box if it exists
        const allInputs = document.querySelectorAll('input');
        allInputs.forEach(input => {
            if (input.parentNode) input.parentNode.removeChild(input);
        });
    }
    // (Remove duplicate cleanup function)
}
