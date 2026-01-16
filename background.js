// Base64 placeholder image (Red Dot) - Uses this if you don't have a file
const PLACEHOLDER_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FOUND_TARGET") {
        
        console.log("Notification Request Received:", request.message);
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png", 
            title: "SpawnTrap Success!",
            message: request.message,
            priority: 2,
            requireInteraction: true,
            silent: false
        }, (notificationId) => {
            
            if (chrome.runtime.lastError) {
                console.error("Notification Error:", chrome.runtime.lastError);
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: PLACEHOLDER_ICON,
                    title: "SpawnTrap (Fallback Icon)",
                    message: request.message,
                    priority: 2,
                    requireInteraction: true
                });
            } else {
                console.log("Notification created with ID:", notificationId);
            }
        });
        sendResponse({status: "success", received: true});
    }

    return true;
});