importScripts('c2pa-js-bf62bb583014bccc5a14eb1278243c397b046755/packages/c2pa/dist/c2pa.js');

self.onmessage = async function(e) {
  if (e.data.type === 'checkC2PA') {
    try {
      const imageData = e.data.imageData;
      const reader = new FileReader();
      
      reader.onload = async function() {
        try {
          const result = await c2pa.read(reader.result);
          self.postMessage({ hasC2PA: result.manifestStore !== null });
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