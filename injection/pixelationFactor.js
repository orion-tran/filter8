<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
  <div class="popup-container">
    <h1>Text to Pixel Art</h1>
    <textarea id="input-text" placeholder="Enter your text"></textarea>
    <label for="pixelation-factor">Pixelation Factor:</label>
    <input type="range" id="pixelation-factor" min="1" max="10" value="5">
    <button id="convert-button">Convert</button>
    <div id="pixel-art"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
