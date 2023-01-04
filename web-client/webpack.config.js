import HtmlWebpackPlugin from "html-webpack-plugin";
import path from 'node:path'

export default {
    mode: 'production',  // default
    context: path.join(process.cwd(), 'src'),
    entry: './main.jsx',
    output: {
        path: path.normalize(process.cwd() + '/../ap/dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.jsx', '.js']
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'index.html'
    })],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}