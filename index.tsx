import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeQuestionPool } from './constants/questions';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 初始化问题池 - 从后端API获取
initializeQuestionPool().then(() => {
  console.log('问题池初始化完成');
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
