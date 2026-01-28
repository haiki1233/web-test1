import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định (/) -> vào Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Đường dẫn login (/login) -> vào LoginPage */}
        <Route path="/login" element={<LoginPage />} />

        {/* Nếu người dùng gõ linh tinh (/abcxyz) -> đá về Login */}
        <Route path="*" element={<Navigate to = "/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;