// initialized as stable
let deadLocked = false;

// collect popup elements
var slider = document.getElementById("slider");
var logo = document.getElementById("logo");
// restore state
var scalar = await fetchScalar();
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
    return response.status;
  } catch (error) {
    deadLocked = true;
    setStatusText("Reload page");
    return false;
  }
}

// retrieve slider state
async function fetchScalar() {
  const tab = await getCurrentTab();
  if (tab) {
    var val = 4;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "slider",
      });
      val = response.scale;
      slider.value = val;
    } catch (error) {
      console.log(error);
    }
    return val;
  }
}

// write status to popup
function setStatusText(text) {
  document.getElementById("status").innerHTML = text;
  console.log(`setting status text to: ${text}`);
}

// change logo depending on status
function switchLogo() {
  var file = deadLocked ? "_dead" : state ? "" : "_off"
  logo.src = `../assets/filter8${file}.svg`;
}

// update state when slider is adjusted
slider.addEventListener("change", async () => {
  const tab = await getCurrentTab();
  if (tab) {
    scalar = slider.value;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "slider",
        scale: scalar,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
});

// toggle extension when logo is pressed
logo.addEventListener("click", async () => {
  const tab = await getCurrentTab();
  if (tab && !deadLocked) {
    state = !state;
    switchLogo();
    setStatusText(deadLocked ? "deadlocked" : (state ? "on" : "off"));

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "toggle",
    });
    console.log(response);
  }
});
