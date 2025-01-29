import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaComments } from "react-icons/fa"; 

const UserConnect = ({ setGlobalSocket }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnter = (e) => {
    if(e.key == "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const handleConnect = () => {
    if (!username.trim()) {
      alert("닉네임을 입력하세요!");
      return;
    }

    setLoading(true); // 연결 중 UI 표시

    const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
      autoConnect: false,
      query: { username: username },
    });

    socketInstance.connect();

    socketInstance.on("connect", () => {
      console.log("소켓 연결 완료");
      localStorage.setItem("username", username); // 닉네임 저장
      setGlobalSocket(socketInstance); // 글로벌 소켓 설정

      navigate("/chat"); // 채팅 화면으로 이동
    });


    socketInstance.on("connect_error", (err) => {
      console.error("소켓 연결 실패:", err);
      alert("서버 연결에 실패했습니다.");
      setLoading(false);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-100 to-yellow-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-80 flex flex-col items-center">
        {/* 채팅 아이콘 */}
        <FaComments className="text-yellow-500 text-5xl mb-3" />
        
        {/* 제목 */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">진욱쓰 오픈챗 입장</h1>
  
        {/* 닉네임 입력 */}
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={username}
          maxLength={10}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-full text-center focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 shadow-md"
        />
  
        {/* 입장 버튼 */}
        <button
          onClick={handleConnect}
          onKeyUp={handleEnter}
          className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "연결 중..." : "입장하기"}
        </button>
      </div>
    </div>
  );
};

export default UserConnect;
