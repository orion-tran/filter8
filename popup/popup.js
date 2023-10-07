async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

let deadLocked = false;

function setStatusText(text) {
  // TODO: code to set status text to the text
  console.log(`setting status text to: ${text}`);
}

async function fetchStatus() {
  const tab = await getCurrentTab();
  if (!tab) {
    setStatusText("Not currently in a tab");
    deadLocked = true;
    return false;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "status",
    });
    return response.status;
  } catch (error) {
    deadLocked = true;
    setStatusText("Reload page");
    return false;
  }
}

var state = await fetchStatus();

var logo = document.getElementById("logo");
logo.src = state ? "filter8.svg" : "filter8_off.svg";
logo.addEventListener("click", async () => {
  const tab = await getCurrentTab();
  if (tab && !deadLocked) {
    state = !state;
    logo.src = state ? "filter8.svg" : "filter8_off.svg";

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "toggle",
    });
    console.log(response);
  }
});
