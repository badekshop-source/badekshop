"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const encodedMessage = encodeURIComponent(message);
      window.open(
        `https://wa.me/6281933302000?text=${encodedMessage}`,
        "_blank"
      );
      setMessage("");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">badekshop Support</h4>
                  <p className="text-green-100 text-sm">Typically replies in minutes</p>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm mb-4">
                <p className="text-gray-700 text-sm">
                  Hi there! 👋 Welcome to badekshop. How can we help you today?
                </p>
              </div>

              {/* Quick Replies */}
              <div className="space-y-2 mb-4">
                <QuickReply
                  text="I need help choosing a plan"
                  onClick={() => setMessage("Hi, I need help choosing a plan for my trip to Bali")}
                />
                <QuickReply
                  text="Track my order"
                  onClick={() => setMessage("Hi, I want to track my order")}
                />
                <QuickReply
                  text="Question about KYC"
                  onClick={() => setMessage("Hi, I have a question about the KYC process")}
                />
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickReply({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 bg-white rounded-full text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border border-gray-200"
    >
      {text}
    </button>
  );
}
