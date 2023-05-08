import HtmlWebpackPlugin from "html-webpack-plugin";
import path from 'node:path'
import FaviconsWebpackPlugin from 'favicons-webpack-plugin'

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
    }),
    // new FaviconsWebpackPlugin('./favicon.ico')
    ],
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
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            }
        ]
    },
    devServer: {
        port: 3001, 
        open: true,
        proxy: {
            '/': {
                target: 'https://localhost',
                secure: false
            }
        }
    }
}