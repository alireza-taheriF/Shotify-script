// ==UserScript==
// @name         Shopify Auto Accept Category Metafields
// @namespace    https://shotify-script.com
// @version      1.0.0
// @description  Automatically accepts Shopify's product Category metafield suggestions and saves the product
// @author       Shotify Script
// @match        https://*.myshopify.com/admin/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration for different languages
    const DEFAULT_LABELS = {
        accept: ['Accept', 'Accept all', 'Approve', 'Confirm'],
        save: ['Save', 'Save changes', 'Update', 'Apply'],
        run: 'Run',
        config: 'Config',
        title: 'Auto Accept',
        accepted: 'Accepted ✔',
        saved: 'Saved 💾',
        error: 'Error ❌',
        noButtons: 'No buttons found',
        running: 'Running...'
    };

    // Load custom labels from localStorage
    function loadCustomLabels() {
        try {
            const stored = localStorage.getItem('shopify-auto-accept-labels');
            return stored ? { ...DEFAULT_LABELS, ...JSON.parse(stored) } : DEFAULT_LABELS;
        } catch (e) {
            return DEFAULT_LABELS;
        }
    }

    let labels = loadCustomLabels();

    // Create mini UI panel
    function createUIPanel() {
        const panel = document.createElement('div');
        panel.id = 'shopify-auto-accept-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 200px;
            background: #fff;
            border: 2px solid #008060;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #008060;">${labels.title}</div>
            <button id="run-btn" style="
                width: 100%;
                padding: 8px;
                margin-bottom: 8px;
                background: #008060;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">${labels.run}</button>
            <button id="config-btn" style="
                width: 100%;
                padding: 8px;
                background: #f6f6f7;
                color: #333;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">${labels.config}</button>
        `;

        document.body.appendChild(panel);

        // Add event listeners
        document.getElementById('run-btn').addEventListener('click', runAutoAccept);
        document.getElementById('config-btn').addEventListener('click', showConfigDialog);
    }

    // Show configuration dialog
    function showConfigDialog() {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        dialog.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                width: 400px;
                max-width: 90%;
            ">
                <h3 style="margin-top: 0;">Customize Labels</h3>
                <p>Enter custom button labels (comma-separated for multiple options):</p>
                
                <label style="display: block; margin-bottom: 5px;">Accept buttons:</label>
                <input type="text" id="accept-input" value="${labels.accept.join(', ')}" style="
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                ">
                
                <label style="display: block; margin-bottom: 5px;">Save buttons:</label>
                <input type="text" id="save-input" value="${labels.save.join(', ')}" style="
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                ">
                
                <div style="text-align: right;">
                    <button id="save-config" style="
                        background: #008060;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-right: 8px;
                    ">Save</button>
                    <button id="cancel-config" style="
                        background: #f6f6f7;
                        color: #333;
                        border: 1px solid #ddd;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('save-config').addEventListener('click', () => {
            const acceptLabels = document.getElementById('accept-input').value.split(',').map(s => s.trim()).filter(s => s);
            const saveLabels = document.getElementById('save-input').value.split(',').map(s => s.trim()).filter(s => s);
            
            if (acceptLabels.length > 0 && saveLabels.length > 0) {
                labels.accept = acceptLabels;
                labels.save = saveLabels;
                localStorage.setItem('shopify-auto-accept-labels', JSON.stringify(labels));
                showToast('Configuration saved!', 'success');
            } else {
                showToast('Please enter valid labels', 'error');
            }
            
            document.body.removeChild(dialog);
        });

        document.getElementById('cancel-config').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: '#008060',
            error: '#d82c0d',
            info: '#008060'
        };
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10002;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    // Find button by text content or aria-label
    function findButton(buttonTexts, ariaLabels = []) {
        // Search by text content
        for (const text of buttonTexts) {
            const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
            for (const button of buttons) {
                if (button.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
                    return button;
                }
            }
        }
        
        // Search by aria-label
        for (const ariaLabel of ariaLabels) {
            const button = document.querySelector(`[aria-label*="${ariaLabel}"]`);
            if (button) return button;
        }
        
        return null;
    }

    // Wait for element to be visible and enabled
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                const element = typeof selector === 'function' ? selector() : document.querySelector(selector);
                
                if (element && element.offsetParent !== null && !element.disabled) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Element not found or not visible'));
                } else {
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    }

    // Main auto-accept function
    async function runAutoAccept() {
        try {
            showToast(labels.running, 'info');
            
            // Find and click Accept button
            const acceptButton = findButton(labels.accept, ['Accept', 'Accept all']);
            
            if (!acceptButton) {
                showToast(labels.noButtons, 'error');
                return;
            }

            // Wait for button to be visible and enabled
            await waitForElement(() => acceptButton);
            
            // Click Accept button
            acceptButton.click();
            showToast(labels.accepted, 'success');
            
            // Wait a bit for the UI to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Find and click Save button
            const saveButton = findButton(labels.save, ['Save', 'Save changes']);
            
            if (!saveButton) {
                showToast('Save button not found', 'error');
                return;
            }

            // Wait for save button to be visible and enabled
            await waitForElement(() => saveButton);
            
            // Click Save button
            saveButton.click();
            showToast(labels.saved, 'success');
            
        } catch (error) {
            console.error('Auto Accept Error:', error);
            showToast(`${labels.error}: ${error.message}`, 'error');
        }
    }

    // Keyboard shortcut handler
    function handleKeyboardShortcut(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'S') {
            event.preventDefault();
            runAutoAccept();
        }
    }

    // Initialize the script
    function init() {
        // Only run on product edit pages
        if (!window.location.pathname.includes('/admin/products/') || window.location.pathname.includes('/admin/products/new')) {
            return;
        }

        // Wait for page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Create UI panel
        createUIPanel();
        
        // Add keyboard shortcut
        document.addEventListener('keydown', handleKeyboardShortcut);
        
        // Auto-run if there are category metafield suggestions
        setTimeout(() => {
            const acceptButton = findButton(labels.accept, ['Accept', 'Accept all']);
            if (acceptButton) {
                showToast('Category suggestions detected! Use Ctrl+Shift+S or click Run', 'info');
            }
        }, 2000);
    }

    // Start the script
    init();

})();
