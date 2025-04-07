import { createC2pa } from 'c2pa';

// Initialize C2PA with proper configuration
let c2paInstance = null;

async function initC2pa() {
  try {
    console.log('Initializing C2PA library...');
    
    // Create C2PA instance with worker configuration
    c2paInstance = createC2pa({
      // Use web accessible resources
      workerUrl: chrome.runtime.getURL('dist/c2pa.worker.js'),
      wasmUrl: chrome.runtime.getURL('dist/assets/wasm/c2pa_wasm_bg.wasm')
    });
    
    console.log('C2PA library initialized successfully');
    return c2paInstance;
  } catch (error) {
    console.error('Failed to initialize C2PA library:', error);
    throw error;
  }
}

// Initialize C2PA on startup
initC2pa();

// Cache for already checked images
const imageCache = new Map();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'checkC2PA') {
    // Check if we've already analyzed this image
    if (imageCache.has(request.imageUrl)) {
      console.log('Cache hit for', request.imageUrl);
      sendResponse({ hasC2PA: imageCache.get(request.imageUrl) });
      return true;
    }

    // Ensure C2PA is initialized
    (async () => {
      try {
        if (!c2paInstance) {
          c2paInstance = await initC2pa();
        }
        
        // Fetch the image and check for C2PA metadata
        const hasC2PA = await fetchAndCheckC2PA(request.imageUrl);
        
        // Cache the result
        imageCache.set(request.imageUrl, hasC2PA);
        
        // Send response back to content script
        sendResponse({ hasC2PA });
      } catch (error) {
        console.error('Error checking C2PA:', error);
        sendResponse({ hasC2PA: false, error: error.message });
      }
    })();
    
    // Return true to indicate that we'll respond asynchronously
    return true;
  }
});

// Function to fetch image and check for C2PA metadata
async function fetchAndCheckC2PA(imageUrl) {
  try {
    console.log('Fetching image:', imageUrl);
    
    if (!c2paInstance) {
      console.log('C2PA not initialized, initializing now...');
      c2paInstance = await initC2pa();
    }
    
    // Directly use the read method with URL
    console.log('Using c2pa.read with URL:', imageUrl);
    const result = await c2paInstance.read({ url: imageUrl });
    
    console.log('C2PA check result:', result);
    
    // Check if the result has manifest data
    return !!(result && result.manifestStore);
  } catch (error) {
    console.error('Error in fetchAndCheckC2PA:', error);
    return false;
  }
}

// Helper function to convert Blob to ArrayBuffer
function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
} 