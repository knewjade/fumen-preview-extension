const path = require('path');

module.exports = {
    entry: [
        './src/background.ts'
    ],
    output: {
        filename: 'background.js',
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