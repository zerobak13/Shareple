// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // /oauth2로 시작하는 모든 요청을 백엔드(8080)로 전달
    app.use(
        createProxyMiddleware('/oauth2', {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false, // HTTPS가 아니어도 OK
        })
    );

    // /api로 시작하는 요청도 백엔드(8080)로 전달
    app.use(
        createProxyMiddleware('/api', {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
        })
    );
};
