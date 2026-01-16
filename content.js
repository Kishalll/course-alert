// --- STEALTH CONFIGURATION ---
const MIN_DELAY = 2000;
const MAX_DELAY = 4500;

// --- DYNAMIC VARIABLES ---
let TARGET_FACULTY_LIST = []; 
let TARGET_COURSE_CODE = ""; 
let TARGET_SLOT_LIST = []; 

function getRandomDelay() {
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1) + MIN_DELAY);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- INITIALIZATION ---
function loadConfigAndStart() {
    chrome.storage.local.get(['courseCode', 'facultyNames', 'slots'], (data) => {
        if (data.courseCode && data.facultyNames && data.slots) {
            
            // FIX: Force Course Code to UpperCase to be Case-Insensitive
            TARGET_COURSE_CODE = data.courseCode.trim().toUpperCase();
            
            TARGET_FACULTY_LIST = data.facultyNames.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
            TARGET_SLOT_LIST = data.slots.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
            
            console.log("[SpawnTrap] Config Loaded:", {TARGET_COURSE_CODE, TARGET_FACULTY_LIST, TARGET_SLOT_LIST});
            
            initControlPanel();
            runSpawnTrap();
        } else {
            alert("⚠️ SPAWNTRAP NOT CONFIGURED!\n\nClick the extension icon to set it up.");
        }
    });
}

// --- UI: STATUS PANEL ---
function initControlPanel() {
    if (document.getElementById('spawntrap-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'spawntrap-panel';
    panel.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        background: #1a1a1a; color: #fff; padding: 15px;
        border: 1px solid #333; border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        font-family: monospace; font-size: 12px; min-width: 180px;
        display: flex; flex-direction: column; gap: 8px;
    `;

    const title = document.createElement('div');
    title.innerText = ">> SPAWNTRAP V4.2";
    title.style.cssText = "font-weight: bold; color: #0f0; margin-bottom: 5px;";
    panel.appendChild(title);

    const info = document.createElement('div');
    info.id = 'spawntrap-info';
    info.innerText = `Target: ${TARGET_COURSE_CODE}`;
    info.style.cssText = "color: #aaa; font-size: 11px; border-bottom: 1px solid #444; padding-bottom: 5px;";
    panel.appendChild(info);

    const btnToggle = document.createElement('button');
    btnToggle.id = 'spawntrap-toggle-btn';
    btnToggle.style.cssText = "padding: 8px; cursor: pointer; font-weight: bold; border: none; border-radius: 4px;";

    const btnTest = document.createElement('button');
    btnTest.innerText = "🔔 TEST ALARM";
    btnTest.style.cssText = "padding: 5px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;";

    const statusLog = document.createElement('div');
    statusLog.id = 'spawntrap-status';
    statusLog.innerText = "Initializing...";
    statusLog.style.color = "#ffeb3b";

    panel.appendChild(btnToggle);
    panel.appendChild(btnTest);
    panel.appendChild(statusLog);
    document.body.appendChild(panel);

    btnTest.onclick = () => {
        statusLog.innerText = "Signal Sent...";
        statusLog.style.color = "#007bff";
        chrome.runtime.sendMessage({
            type: "FOUND_TARGET",
            message: "TEST SUCCESS: Notification works!"
        }, (response) => {
            if (response && response.status === "success") {
                statusLog.innerText = "Success!";
                statusLog.style.color = "#0f0";
            }
        });
        setTimeout(() => { statusLog.innerText = "Idle..."; statusLog.style.color = "#888"; }, 2000);
    };

    const updateBtn = () => {
        const isPaused = localStorage.getItem("SPAWNTRAP_STATUS") === "PAUSED";
        btnToggle.innerText = isPaused ? "▶ RESUME" : "⏸ PAUSE";
        btnToggle.style.backgroundColor = isPaused ? "#28a745" : "#dc3545";
        btnToggle.style.color = "white";
    };
    updateBtn();

    btnToggle.onclick = () => {
        const isPaused = localStorage.getItem("SPAWNTRAP_STATUS") === "PAUSED";
        localStorage.setItem("SPAWNTRAP_STATUS", isPaused ? "RUNNING" : "PAUSED");
        updateBtn();
    };
}

function updateStatus(msg, color = "#888") {
    const el = document.getElementById('spawntrap-status');
    if (el) {
        el.innerText = msg;
        el.style.color = color;
    }
}

// --- MAIN LOOP ---
async function runSpawnTrap() {
    if (localStorage.getItem("SPAWNTRAP_STATUS") === "PAUSED") {
        updateStatus("Paused.", "#ffeb3b");
        await sleep(2000);
        runSpawnTrap();
        return;
    }

    const pageText = document.body.innerText;
    
    // Improved Detection
    const isCourseListPage = pageText.includes("COURSE DETAIL") && pageText.includes("CREDIT");
    const isFacultyPage = pageText.includes("Available Seats") && pageText.includes("Alloted Seats");

    if (isFacultyPage) {
        updateStatus("State: Faculty List", "#0f0");
        await handleFacultyPage();
    } 
    else if (isCourseListPage) {
        updateStatus("State: Course List", "#00bfff");
        await handleCourseListPage();
    }
    else {
        updateStatus("State: Unknown...", "#888");
        setTimeout(runSpawnTrap, 1500);
    }
}

async function handleCourseListPage() {
    const rows = Array.from(document.querySelectorAll('tr'));
    
    // CASE INSENSITIVE SEARCH
    const courseRow = rows.find(row => row.innerText.toUpperCase().includes(TARGET_COURSE_CODE));
    
    if (courseRow) {
        let viewBtn = Array.from(courseRow.querySelectorAll('*')).find(el => 
            el.innerText && el.innerText.trim() === "View Slot"
        );

        if (!viewBtn) {
            viewBtn = courseRow.querySelector('button[onclick*="View"], span[onclick*="View"]');
        }

        if (viewBtn) {
            const delay = getRandomDelay();
            updateStatus(`Clicking in ${delay/1000}s...`, "#ff9800");
            console.log(`[SpawnTrap] Found View Slot button. Clicking in ${delay}ms.`);
            
            await sleep(delay);
            viewBtn.click();
            setTimeout(runSpawnTrap, 3000); 
        } else {
            updateStatus("Error: Button Not Found", "red");
            setTimeout(runSpawnTrap, 2000);
        }
    } else {
        updateStatus(`Searching: ${TARGET_COURSE_CODE}...`, "#888");
        setTimeout(runSpawnTrap, 2000);
    }
}

async function handleFacultyPage() {
    let goBackBtn = Array.from(document.querySelectorAll('button, .btn')).find(el => 
        el.innerText && el.innerText.trim() === "Go Back"
    );

    if (!goBackBtn) goBackBtn = document.querySelector('button[onclick*="goBack"]');

    if (!goBackBtn) {
        updateStatus("Error: No Back Button", "red");
        setTimeout(runSpawnTrap, 2000);
        return;
    }

    const rows = Array.from(document.querySelectorAll('tr'));
    let foundTarget = false;

    for (let row of rows) {
        const rowText = row.innerText.toUpperCase();
        const isTargetFaculty = TARGET_FACULTY_LIST.some(name => rowText.includes(name));

        if (isTargetFaculty) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) continue;
            
            const slotText = cells[0].innerText.trim().toUpperCase(); 
            const seatsText = cells[cells.length - 1].innerText.trim();
            const seats = parseInt(seatsText);
            
            const isTargetSlot = TARGET_SLOT_LIST.some(s => slotText.includes(s));

            if (isTargetSlot && seats > 0) {
                foundTarget = true;
                localStorage.setItem("SPAWNTRAP_STATUS", "PAUSED");
                const btn = document.getElementById('spawntrap-toggle-btn');
                if (btn) { btn.innerText = "▶ RESUME"; btn.style.backgroundColor = "#28a745"; }

                updateStatus("TARGET ACQUIRED!", "#0f0");

                // SMS Alert
                chrome.storage.local.get(['twilioSid', 'twilioToken', 'twilioFrom', 'twilioTo'], (data) => {
                    const smsData = {
                        sid: data.twilioSid, token: data.twilioToken,
                        from: data.twilioFrom, to: data.twilioTo,
                        body: `🚨 VTOP ALERT: Found ${TARGET_COURSE_CODE} / ${slotText} / ${seats} seats!`
                    };
                    
                    chrome.runtime.sendMessage({
                        type: "FOUND_TARGET_SMS",
                        smsData: smsData,
                        message: `!!! FOUND !!! ${slotText} (${seats} seats)`
                    });
                });

                alert(`TARGET ACQUIRED!\n\nSlot: ${slotText}\nSeats: ${seats}\n\nCLICK REGISTER NOW!`);
                return;
            }
        }
    }

    if (!foundTarget) {
        const delay = getRandomDelay();
        updateStatus(`Not Found. Back in ${delay/1000}s`, "#888");
        await sleep(delay);
        goBackBtn.click();
        setTimeout(runSpawnTrap, 3000);
    }
}

// Start
loadConfigAndStart();
