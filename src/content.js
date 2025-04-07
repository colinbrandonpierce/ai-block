// Create a MutationObserver to watch for new images
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'IMG') {
        checkImage(node);
      }
    });
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Check existing images
document.querySelectorAll('img').forEach(checkImage);

// Image cache to avoid re-processing
const processedImages = new Set();

// C2PA identifiers to look for
const C2PA_MARKERS = ['c2pa', 'C2PA', 'jumbf', 'JUMBF', 'c2pa.manifest', 'contentauth'];

async function checkImage(imgElement) {
  // Skip if the image is already processed or if its src is invalid
  if (imgElement.classList.contains('c2pa-processed') || 
      !imgElement.src || 
      imgElement.src.startsWith('data:') ||
      processedImages.has(imgElement.src)) {
    return;
  }

  try {
    // Mark the image as processed to avoid duplicate processing
    imgElement.classList.add('c2pa-processed');
    processedImages.add(imgElement.src);
    
    // Fetch the image as an array buffer
    const response = await fetch(imgElement.src);
    const buffer = await response.arrayBuffer();
    
    // Convert to text to search for markers
    const textDecoder = new TextDecoder('utf-8');
    const text = textDecoder.decode(buffer);
    
    // Check for any C2PA markers
    const hasC2PA = C2PA_MARKERS.some(marker => text.includes(marker));
    
    if (hasC2PA) {
      console.log('C2PA metadata detected in:', imgElement.src);
      imgElement.classList.add('c2pa-blurred');
    }
  } catch (error) {
    console.error('Error processing image:', error);
  }
} 