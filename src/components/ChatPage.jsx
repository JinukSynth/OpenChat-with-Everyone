import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessages from "./chat";
import ChatInput from "./ChatInput";

const ChatPage = ({ socket }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername || !socket) {
      alert("닉네임이 없거나 연결되지 않았습니다!");
      navigate("/");
      return;
    }
    setUsername(storedUsername);

    socket.on("load_messages", (loadMessages) => {
      setMessages(loadMessages);
    });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("load_messages");
      socket.off("message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (!userInput.trim()) return;
    socket?.emit("message", { username, message: userInput });
    setUserInput("");
  };

  return (
    <div className="flex flex-col mx-auto bg-gray-200 w-80 sm:w-96 md:max-w-lg sm: h-[700px] md:h-[800px] mt-24 rounded-xl shadow-2xl">
      <div className="bg-yellow-500 text-white text-center py-4 text-lg font-bold shadow-md rounded-xl">
        오픈채팅에 오신 것을 환영합니다!
      </div>
      <ChatMessages messages={messages} username={username} />
      <ChatInput userInput={userInput} setUserInput={setUserInput} sendMessage={sendMessage} />
    </div>
  );
};

export default ChatPage;
