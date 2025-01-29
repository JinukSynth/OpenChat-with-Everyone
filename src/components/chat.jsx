import { useRef, useEffect } from "react";

const ChatMessages = ({ messages, username }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => (
        message.username === "관리자" ? (
          // 📌 관리자 메시지는 P 태그로 표시
          <p key={index} className="text-center text-sm text-gray-500">
            {message.message}
          </p>
        ) : (
          // 📌 일반 채팅 메시지
          <div key={index} className={`flex ${message.username === username ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs p-3 rounded-xl shadow-md ${
                message.username === username ? "bg-yellow-500 text-white text-right" : "bg-white text-black border border-gray-300 text-left"
              }`}>
              <span className="text-sm font-semibold block mb-1">
                {message.username === username ? "나" : message.username}
              </span>
              <div className="text-base">{message.message}</div>
            </div>
          </div>
        )
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};


export default ChatMessages;