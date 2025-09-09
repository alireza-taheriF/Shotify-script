# User Guide - Shopify Auto Accept

## 🎯 What does this system do?

This system automatically accepts "Category metafield suggestions" in Shopify Admin and saves the product. No more manual clicking on "Accept" and "Save" buttons!

## 📋 What do you need to do?

### Step 1: Install Tampermonkey

1. **Chrome:** Go to [this link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) and click "Add to Chrome"
2. **Firefox:** Go to [this link](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) and click "Add to Firefox"

### Step 2: Install Script

1. Open the `shopify-auto-accept.user.js` file
2. **Select all content** (Ctrl+A) and copy it (Ctrl+C)
3. Click on the Tampermonkey icon in your browser
4. Select "Create a new script"
5. Delete all existing code and paste the copied code
6. Press Ctrl+S to save

### Step 3: Usage

1. Go to Shopify Admin → Products → Select a product
2. You'll see a small panel in the top-right corner titled "Auto Accept"
3. Two ways to use it:
   - **Method 1:** Click the "Run" button
   - **Method 2:** Press Ctrl+Shift+S keys

## 🎬 How does it work?

### When you click "Run":

1. **Search:** System looks for the "Accept" button
2. **First Click:** Clicks the "Accept" button
3. **Wait:** Waits 1 second
4. **Search:** Looks for the "Save" button
5. **Second Click:** Clicks the "Save" button
6. **Notification:** Shows you the result

### Notifications you'll see:

- 🟢 **"Accepted ✔"** = Suggestions accepted
- 🟢 **"Saved 💾"** = Product saved
- 🔴 **"No buttons found"** = Buttons not found
- 🔴 **"Error ❌"** = Something went wrong

## ⚙️ Settings (Optional)

### If buttons are in a different language:

1. Click the "Config" button in the panel
2. Enter new labels (e.g., "Accept, Approve" for Accept buttons)
3. Click "Save"

### Example labels for different languages:

**English:**
- Accept: "Accept, Accept all, Approve, Confirm"
- Save: "Save, Save changes, Update, Apply"

**German:**
- Accept: "Akzeptieren, Bestätigen, Annehmen"
- Save: "Speichern, Änderungen speichern, Aktualisieren"

**French:**
- Accept: "Accepter, Tout accepter, Confirmer"
- Save: "Enregistrer, Enregistrer les modifications, Mettre à jour"

**Spanish:**
- Accept: "Aceptar, Aceptar todo, Confirmar"
- Save: "Guardar, Guardar cambios, Actualizar"

## 🚨 Common Issues

### You see "No buttons found"?
- Make sure you're on a product edit page
- Refresh the page
- Wait a few seconds for it to fully load

### Panel not showing?
- Make sure Tampermonkey is enabled
- Refresh the page
- You're on the correct page (product edit)

### Buttons not being found?
- Use the "Config" button to enter correct labels
- Or use DevTools (F12 → Console):

```javascript
localStorage.setItem('shopify-auto-accept-labels', JSON.stringify({
    accept: ['Accept', 'Approve', 'Confirm'],
    save: ['Save', 'Save changes', 'Update']
}));
```

## 🔒 Security

- ✅ Only works in Shopify Admin
- ✅ Doesn't send any data
- ✅ Only simulates normal clicks
- ✅ Can be turned off anytime you want

## 📞 Support

If you have issues:

1. **Refresh the page**
2. **Turn Tampermonkey off/on**
3. **Check your labels**
4. **Use DevTools** (F12)

---

**Important Note:** This system only works on product edit pages. It won't do anything on other pages.

**Ready to use!** 🚀