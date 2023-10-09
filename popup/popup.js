// initialized as stable
let deadLocked = false;

// collect popup elements
var overlay = document.getElementById("overlay");
var pixies = document.getElementById("pixies");
var slider = document.getElementById("slider");
var logo = document.getElementById("logo");
// restore state
var state = await fetchStatus();

// adjust logo colors to state
switchLogo();

// enable tab binding for independent behavior
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// serve information about state and return status (bool)
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
    var bool = response.status;
    setStatusText(bool ? "on" : "off");
    slider.value = response.scale;
    pixies.checked = response.pixiesVal;
    overlay.checked = response.overlayVal;
    return bool;
  } catch (error) {
    deadLocked = true;
    setStatusText("Reload page");
    return false;
  }
}

// write status to popup
function setStatusText(text) {
  document.getElementById("status").innerHTML = text;
  console.log(`setting status text to: ${text}`);
}

// change logo depending on status
function switchLogo() {
  let text;
  let shadow;
  if (deadLocked) {
    shadow = "#3c0008";
    text = "#ff0000";
  } else if (state) {
    shadow = "#11450C";
    text = "#18FF04";
  } else {
    shadow = "#2e332c";
    text = "#6d756a";
  }
  document.getElementById("logoShadow").setAttribute("fill", shadow);
  document.getElementById("logoText").setAttribute("fill", text);

}

// toggle extension when logo is pressed
logo.addEventListener("click", async () => {
  const tab = await getCurrentTab();

  try {
    if (tab.url.startsWith("chrome://")) {
      setStatusText("no work here");
      return;
    }
    if (deadLocked) {
      chrome.tabs.reload(tab.id);
      deadLocked = false;
    } else if (tab) {
      state = !state;

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "toggle",
      });
      console.log(response);
    }
    setStatusText(deadLocked ? "deadlocked" : state ? "on" : "off");
    switchLogo();
  } catch (e) {
    console.log(e);
  }
});

// update state when slider is adjusted
slider.addEventListener("change", async () => {
  const tab = await getCurrentTab();
  if (tab) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "slider",
        scale: slider.value,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
});

pixies.addEventListener("change", async () => {
  const tab = await getCurrentTab();
  if (tab) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "pixies",
        pixiesVal: pixies.checked,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
});

overlay.addEventListener("change", async () => {
  const tab = await getCurrentTab();
  if (tab) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "overlay",
        overlayVal: overlay.checked,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
});
