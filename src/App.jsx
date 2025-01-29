import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import ChatPage from "./components/ChatPage";
import UserConnect from "./components/UserConnect";
import "./App.css";
import "./index.css";

function App() {
  const [socket, setSocket] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserConnect setGlobalSocket={setSocket} />} />   {/* 채팅 입장 화면 */}
        <Route path="/chat" element={<ChatPage socket={socket} />} /> {/* 채팅 화면 */}
      </Routes>
    </Router>
  );
}

export default App;
