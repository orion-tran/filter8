async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

let deadLocked = false;

function setStatusText(text) {
  document.getElementById("status").innerHTML = text;
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

function switchLogo() {
  var file = deadLocked ? "_dead" : state ? "" : "_off"
  logo.src = `../assets/filter8${file}.svg`;
}

var slider = document.getElementById("slider");
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

var scalar = await fetchScalar();

slider.addEventListener("change", async () => {
  const tab = await getCurrentTab();
  if (tab) {
    scalar = slider.value;
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "slider",
      scale: scalar,
    });
    console.log(response);
  }
});

switchLogo();
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
