const MENU_ID = 'ICHTHYS_CONTEXT_MENU'

function sendText(info, tab) {
    if (info.menuItemId !== MENU_ID) return;

    chrome.tabs.create({  
        url: 'ichthys://' + encodeURI(info.selectionText)
    });
}

chrome.contextMenus.create({
    title: 'Search with Ichthys', 
    contexts: ['selection'], 
    id: MENU_ID
});

chrome.contextMenus.onClicked.addListener(sendText);
