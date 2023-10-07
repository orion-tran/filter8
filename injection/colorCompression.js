// Import the ColorConverter library
const { rgb2oklab, oklab2rgb } = require('colorconverter');

// Define color palette in RGB format
const colorPalette = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  // Add more colors as needed
];

// Define the number of colors you want in the compressed palette
const numColorsInCompressedPalette = 5; // Adjust this as needed

// Convert the RGB color palette to OKLAB color space
const oklabPalette = colorPalette.map(({ r, g, b }) => rgb2oklab(r, g, b));

// Implement the color palette compression algorithm (e.g., k-means)
// You can use a library like 'node-kmeans' for clustering or implement your own algorithm here.

// In this example, we'll just select the first 'numColorsInCompressedPalette' colors.
const compressedPalette = oklabPalette.slice(0, numColorsInCompressedPalette);

// Convert the compressed OKLAB colors back to RGB
const compressedRGBPalette = compressedPalette.map(({ L, A, B }) => oklab2rgb(L, A, B));

console.log('Original RGB Palette:');
console.log(colorPalette);

console.log('\nCompressed RGB Palette:');
console.log(compressedRGBPalette);


//to run the js file:
//node color_compression.js


