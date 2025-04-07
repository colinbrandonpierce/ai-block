import { createC2pa } from 'c2pa';

const c2pa = createC2pa();

self.onmessage = async function(e) {
  if (e.data.type === 'checkC2PA') {
    try {
      const imageData = e.data.imageData;
      const mimeType = e.data.mimeType;
      
      console.log('Worker received image data:', {
        size: imageData.size,
        type: imageData.type,
        mimeType: mimeType
      });
      
      const reader = new FileReader();
      
      reader.onload = async function() {
        try {
          console.log('Checking for C2PA metadata with mimeType:', mimeType);
          console.log('ArrayBuffer size:', reader.result.byteLength);
          
          const result = await c2pa.read({ 
            buffer: reader.result,
            mimeType: mimeType
          });
          
          console.log('C2PA check result:', result);
          
          // Check if the result has a manifestStore property
          const hasC2PA = result && result.manifestStore;
          
          self.postMessage({ hasC2PA });
        } catch (error) {
          console.error('C2PA processing error:', error);
          self.postMessage({ hasC2PA: false });
        }
      };
      
      reader.readAsArrayBuffer(imageData);
    } catch (error) {
      console.error('Worker error:', error);
      self.postMessage({ hasC2PA: false });
    }
  }
}; 