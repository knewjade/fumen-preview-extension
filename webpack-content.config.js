const path = require('path');

module.exports = {
    entry: [
        './src/content.ts'
    ],
    output: {
        filename: 'content.js',
        path: path.join(__dirname, 'extention')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};