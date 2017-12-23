console.log("crypto-king content script up and running! :)")

chrome.tabs.executeScript(tab.id, {code:
    "document.body.appendChild(document.createElement('script')).src = 'https://example.com/script.js';"
});