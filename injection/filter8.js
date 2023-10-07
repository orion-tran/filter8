let filtering = false;

function toggleFiltering() {
  filtering = !filtering;

  if (filtering) filterOn();
  else filterOff();
}

function filterOn() {
  console.log("filtering ON!");

  const allImages = document.querySelectorAll("img");

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

    img.src = imageCrusher.toDataURL();
    img.style.imageRendering = "pixelated";

    img.style.width = imageCrusher.width * 8 + "px";
    img.style.height = imageCrusher.height * 8 + "px";

    imageCrusher.remove();
  });
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
