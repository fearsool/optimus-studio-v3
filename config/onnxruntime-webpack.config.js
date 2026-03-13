const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (config, { isServer, dev }) => {
    // 1. Add .node file loader
    config.module.rules.push({
        test: /\.node$/,
        loader: 'node-loader',
    });

    // 2. Ignore onnxruntime-node in browser build to avoid "fs" errors
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            os: false,
            child_process: false,
        };
    }

    // 3. Copy ONNX wasm files for browser usage (if using onnxruntime-web)
    // config.plugins.push(
    //     new CopyPlugin({
    //         patterns: [
    //             {
    //                 from: path.join(__dirname, '../node_modules/onnxruntime-web/dist/*.wasm'),
    //                 to: path.join(__dirname, '../public/static/chunks/pages/[name][ext]'),
    //             },
    //         ],
    //     })
    // );

    // 4. Externals for onnxruntime-node in server build
    if (isServer) {
        config.externals.push('onnxruntime-node');
        config.externals.push('sharp'); // Common optional dep
    }

    return config;
};
