# Shopify Auto Accept Category Metafields

A complete package for automatically accepting Shopify's product "Category metafield suggestions" inside the Shopify Admin product edit page.

## Features

- ✅ **Automatic acceptance** of Category metafield suggestions
- ✅ **Automatic saving** of product after acceptance
- ✅ **Real click simulation** (not API) to preserve Shopify's suggestion logic
- ✅ **Multi-language support** (English, and customizable for other languages)
- ✅ **Interactive UI panel** with Run and Config buttons
- ✅ **Keyboard shortcut** (Ctrl+Shift+S)
- ✅ **Status notifications** (Toast notifications)
- ✅ **Simple bookmarklet** for one-time execution

## Installation & Setup

### Method 1: Tampermonkey Userscript (Recommended)

1. **Install Tampermonkey:**
   - Chrome: [Tampermonkey Extension](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Tampermonkey Add-on](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. **Install Script:**
   - Open the `shopify-auto-accept.user.js` file
   - Copy the entire file content
   - In Tampermonkey, click "Create a new script"
   - Replace the existing content with the code
   - Press Ctrl+S to save

3. **Usage:**
   - Go to a product edit page in Shopify Admin
   - The "Auto Accept" panel will appear in the top-right corner
   - Click the "Run" button or press Ctrl+Shift+S

### Method 2: Bookmarklet (Simple)

1. **Create Bookmark:**
   - Copy the content from `AutoAccept.bookmarklet.txt`
   - Create a new bookmark
   - Replace the URL with the JavaScript code
   - Name the bookmark "Auto Accept"

2. **Usage:**
   - On a Shopify Admin product edit page
   - Click the bookmark

## Advanced Configuration

### Customizing Labels for Different Languages

If your Shopify Admin is in a different language:

1. **Via UI Panel:**
   - Click the "Config" button in the panel
   - Enter new labels (comma-separated for multiple options)
   - Click "Save"

2. **Via DevTools:**
   ```javascript
   // Open DevTools (F12)
   // Go to Console
   localStorage.setItem('shopify-auto-accept-labels', JSON.stringify({
       accept: ['Accept', 'Approve', 'Confirm'],
       save: ['Save', 'Update', 'Apply']
   }));
   ```

### Example Label Sets for Different Languages

```javascript
// English
{
    accept: ['Accept', 'Accept all', 'Approve', 'Confirm'],
    save: ['Save', 'Save changes', 'Update', 'Apply']
}

// German
{
    accept: ['Akzeptieren', 'Alle akzeptieren', 'Bestätigen'],
    save: ['Speichern', 'Änderungen speichern', 'Aktualisieren']
}

// French
{
    accept: ['Accepter', 'Tout accepter', 'Confirmer'],
    save: ['Enregistrer', 'Enregistrer les modifications', 'Mettre à jour']
}

// Spanish
{
    accept: ['Aceptar', 'Aceptar todo', 'Confirmar'],
    save: ['Guardar', 'Guardar cambios', 'Actualizar']
}
```

## How It Works

### Userscript (Tampermonkey)

1. **Page Detection:** Only activates on product edit pages
2. **Wait for Loading:** Waits for the page and Category card to fully load
3. **Button Search:** Finds Accept and Save buttons by text and aria-label
4. **Sequential Clicking:** Clicks Accept first, then Save
5. **Status Notifications:** Shows the result of each step

### Bookmarklet

- Similar functionality to userscript but without UI panel
- One-time execution when bookmark is clicked
- Uses settings from localStorage

## Troubleshooting

### Common Issues

1. **"No buttons found"**
   - Make sure you're on a product edit page
   - Check if button labels are correct
   - Use DevTools to set correct labels

2. **"Element not found or not visible"**
   - Page hasn't fully loaded yet
   - Wait a few seconds and try again

3. **UI Panel not showing**
   - Make sure userscript is enabled
   - Refresh the page
   - You're on the correct page (product edit)

### Status Check

```javascript
// In DevTools Console
console.log('Current labels:', JSON.parse(localStorage.getItem('shopify-auto-accept-labels') || '{}'));
console.log('Accept buttons:', document.querySelectorAll('button[aria-label*="Accept"], button:contains("Accept")'));
console.log('Save buttons:', document.querySelectorAll('button[aria-label*="Save"], button:contains("Save")'));
```

## Important Notes

### Security
- ✅ Only runs in Shopify Admin
- ✅ Doesn't send any data
- ✅ Only simulates UI clicks
- ✅ Can be disabled at any time

### Compatibility
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Shopify Admin (all versions)
- ✅ RTL support

### Limitations
- Only works on product edit pages
- May need updates if Shopify changes UI
- Requires localStorage access for settings

## Support

If you encounter issues:

1. **Check Console:** Look for errors in DevTools
2. **Test Labels:** Use the configuration section
3. **Refresh Page:** Sometimes refreshing helps
4. **Disable/Enable:** Turn userscript off and on

