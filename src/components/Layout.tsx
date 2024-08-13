// src/components/Layout.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Upload from './Upload';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  error?: boolean;
}

const Layout: React.FC = () => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const botMessageRef = useRef<string>('');  // Ref to hold the current bot message

  const handleFileUpload = (fileName: string) => {
    setUploadedFileName(fileName);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    const newMessage = { text: message, sender: 'user' as const };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');
    setLoading(true);

    const botMessageRef = { current: "" };  // Ref to store the ongoing bot message

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ query: message })
        });

        if (!response.body) throw new Error("ReadableStream not supported by response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          let token = chunk.replace(/^data: /, '').trim();
      
          // Check if the current token should be joined with the previous token
          if (botMessageRef.current.endsWith(' ') || token.startsWith(' ')) {
              botMessageRef.current += token;
          } else {
              botMessageRef.current += ` ${token}`;
          }
      
          setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (lastMessage.sender === 'bot') {
                  return [
                      ...prevMessages.slice(0, prevMessages.length - 1),
                      { ...lastMessage, text: botMessageRef.current }
                  ];
              }
              return [...prevMessages, { text: botMessageRef.current, sender: 'bot' }];
          });
      }
      

        setLoading(false);
    } catch (error) {
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: `ERROR: ${(error as any).message}`, sender: 'bot', error: true },
        ]);
        setLoading(false);
    }
};

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <div className="bg-gray-900 text-white w-64 p-4">
          <div className="mb-4">
            <Upload onFileUpload={handleFileUpload} />
          </div>
          <div className="mb-4">
            <h2 className="text-lg">Chats</h2>
            <ul>
              <li className="mt-2">
                <div className="bg-gray-800 p-2 rounded">
                  {uploadedFileName ? uploadedFileName : 'No file uploaded'}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex-1 bg-gray-800 text-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl">Chat with Document</h1>
            <input
              type="text"
              placeholder="Search your document"
              className="bg-gray-700 text-white px-4 py-2 rounded"
            />
          </div>
          <div className="flex-1 bg-gray-700 p-4 rounded overflow-auto">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className={`p-2 rounded mb-2 ${
                    msg.sender === 'user' ? 'bg-blue-500 self-end' : msg.error ? 'bg-red-500' : 'bg-gray-900'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2 rounded mb-2 bg-gray-600 self-end"
              >
                <div className="flex items-center">
                  <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full mr-2" />
                  Typing...
                </div>
              </motion.div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 flex">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message here..."
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Layout;
