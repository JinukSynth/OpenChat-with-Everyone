const ChatInput = ({ userInput, setUserInput, sendMessage }) => {
    
  const handleEnter = (e) => {
      if(e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }

    return (
      <div className="bg-white p-3 shadow-md flex items-center rounded-xl">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyUp={handleEnter}  // enter event
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-3 border border-gray-300 rounded-full outline-none bg-gray-100"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-yellow-500 text-black px-5 py-3 rounded-full shadow-md"
        >
          전송
        </button>
      </div>
    );
  };
  
  export default ChatInput;
  