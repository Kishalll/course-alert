document.addEventListener('DOMContentLoaded', () => {
    // 1. Load saved settings
    chrome.storage.local.get([
        'courseCode', 'facultyNames', 'slots', 
        'twilioSid', 'twilioToken', 'twilioFrom', 'twilioTo'
    ], (data) => {
        if(data.courseCode) document.getElementById('courseCode').value = data.courseCode;
        if(data.facultyNames) document.getElementById('facultyNames').value = data.facultyNames;
        if(data.slots) document.getElementById('slots').value = data.slots;
        
        // Twilio
        if(data.twilioSid) document.getElementById('twilioSid').value = data.twilioSid;
        if(data.twilioToken) document.getElementById('twilioToken').value = data.twilioToken;
        if(data.twilioFrom) document.getElementById('twilioFrom').value = data.twilioFrom;
        if(data.twilioTo) document.getElementById('twilioTo').value = data.twilioTo;
    });

    // 2. Save settings
    document.getElementById('btn-save').addEventListener('click', () => {
        const config = {
            courseCode: document.getElementById('courseCode').value.trim(),
            facultyNames: document.getElementById('facultyNames').value.trim(),
            slots: document.getElementById('slots').value.trim(),
            
            // Twilio
            twilioSid: document.getElementById('twilioSid').value.trim(),
            twilioToken: document.getElementById('twilioToken').value.trim(),
            twilioFrom: document.getElementById('twilioFrom').value.trim(),
            twilioTo: document.getElementById('twilioTo').value.trim()
        };

        chrome.storage.local.set(config, () => {
            const status = document.getElementById('status');
            status.textContent = "Settings Saved! Refresh VTOP page.";
            status.style.color = "#00ff00";
            
            // Optional: Send message to content script to update immediately
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: "CONFIG_UPDATED"});
            });
        });
    });
});