// src/components/Layout.tsx
import React, { useState } from 'react';
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
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, new URLSearchParams({
        query: message
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response.data.response, sender: 'bot' },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `ERROR: ${(error as any).message}`, sender: 'bot', error: true },
      ]);
    } finally {
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
