// ChatBubble.jsx
import React from "react";

const ChatBubble = ({ text, isUser }) => {
  const bubbleBg = isUser
    ? "bg-green-600 text-white rounded-br-none"
    : "bg-blue-600 text-white rounded-bl-none";

  const tailClass = isUser
    ? "right-[-6px] border-l-8 border-t-transparent border-b-transparent border-l-green-600"
    : "left-[-6px] border-r-8 border-t-transparent border-b-transparent border-r-blue-600";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="relative max-w-[80%]">
        <div className={`px-4 py-2 rounded-lg text-sm ${bubbleBg}`}>
          {text}
        </div>
        <div
          className={`absolute top-3 w-0 h-0 border-t-8 border-b-8 ${tailClass}`}
        />
      </div>
    </div>
  );
};

export default ChatBubble;
