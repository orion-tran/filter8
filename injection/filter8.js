let filtering = false;
//function that creates an On/Off Toggle
function toggleFiltering() {
  filtering = !filtering;

  if (filtering) filterOn();
  else filterOff();
}

var urlMap = new Map();
function filterOn() {
  console.log("filtering ON!");

  const allImages = document.querySelectorAll("img");

  try {
    allImages.forEach((img) => {
      const imageCrusher = document.createElement("canvas");
      imageCrusher.width = img.clientWidth / 8;
      imageCrusher.height = img.clientHeight / 8;

      const context = imageCrusher.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, imageCrusher.width, imageCrusher.height);
      context.drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        0,
        0,
        imageCrusher.width,
        imageCrusher.height
      );

      const url = imageCrusher.toDataURL();
      urlMap.set(url, img.src);
      img.src = url;
      img.style.imageRendering = "pixelated";

      img.style.width = imageCrusher.width * 8 + "px";
      img.style.height = imageCrusher.height * 8 + "px";

      imageCrusher.remove();
    });
  } catch (e) {
    if (e.name != "SecurityError") {
      console.log(e.name);
    }
  }
}

function filterOff() {
  console.log("filtering OFF!");

  document.querySelectorAll("img").forEach((img) => {
    if (original = urlMap.get(img.src)) img.src = original;
  });

  urlMap.clear();
}

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // if the popup is asking for state to update its rendering state
  if (request.action === "status") sendResponse({ status: filtering });
  if (request.action === "toggle") {
    toggleFiltering();
    sendResponse({ status: filtering });
  }
});
