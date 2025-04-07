const path = require('path');

module.exports = {
  entry: {
    content: './src/content.js',
    background: './src/background.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js']
  },
  experiments: {
    asyncWebAssembly: true, // Enable WebAssembly support
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource', // Properly handle WASM files
      }
    ]
  }
}; 