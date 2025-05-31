// src/api/axiosInstance.js
import axios from 'axios';

// React 개발 서버(proxy) 덕분에, '/api'로 시작하는 요청은
// 자동으로 http://localhost:8080/api 로 포워딩됩니다.
const instance = axios.create({
    baseURL: '/',           // proxy 설정이 되어 있으므로 '/'로 두면 됩니다.
    withCredentials: true,  // 쿠키(세션)를 항상 포함시키도록 설정
});

export default instance;
