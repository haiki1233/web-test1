import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import './index.css';

// 1. Import TanStack Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// 2. Tạo một "Bộ não" quản lý dữ liệu
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. Bọc App lại để cung cấp sức mạnh cho toàn bộ web */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)