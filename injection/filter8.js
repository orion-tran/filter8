let filtering = false;

function toggleFiltering() {
  filtering = !filtering;

  if (filtering) filterOn();
  else filterOff();
}

function filterOn() {
  console.log("filtering ON!");

  //document.querySelectorAll("img").forEach((e) => console.log(e));
}

function filterOff() {
  console.log("filtering OFF!");
}

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // if the popup is asking for state to update its rendering state
  if (request.action === "status") sendResponse({ status: filtering });
  if (request.action === "toggle") {
    toggleFiltering();
    sendResponse({ status: filtering });
  }
});
