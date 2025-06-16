// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        createProxyMiddleware('/oauth2', {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
            cookieDomainRewrite: 'localhost',  // ✅ 이거 추가!
        })
    );

    app.use(
        createProxyMiddleware('/api', {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
            cookieDomainRewrite: 'localhost',  // ✅ 이거도 같이!
        })
    );
};
