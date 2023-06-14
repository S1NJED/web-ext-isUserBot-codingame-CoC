function listenerUrls(req) {
    const url = req.url;

    // Joined a clash
    if (url === "https://www.codingame.com/services/ClashOfCode/playClash") {
        console.log("User joined a clash!");
        
        browser.tabs.query({ active: true, currentWindow: true })
            .then((tabs) => {
                browser.tabs.sendMessage(tabs[0].id, {data: true});
            })
            .catch((err) => {
                console.log("Error, cannot get clash.");
            })
    }
}

browser.webRequest.onBeforeRequest.addListener(
    listenerUrls,
    {urls: ["https://www.codingame.com/*"]}
)
