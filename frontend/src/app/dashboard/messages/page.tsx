'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import api from '@/lib/api';
import { Send, Search, MessageCircle, Check, CheckCheck } from 'lucide-react';

interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read: boolean;
}

interface Chat {
  _id: string;
  participants: ChatUser[];
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchChats();
  }, []);

  useEffect(() => {
    if (targetUserId && chats.length > 0) {
      const existingChat = chats.find((chat) =>
        chat.participants.some((p) => p._id === targetUserId)
      );

      if (existingChat) {
        handleSelectChat(existingChat);
      } else {
        createNewChat(targetUserId);
      }
    }
  }, [targetUserId, chats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        fetchMessages(selectedChat._id, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/chat');
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      const { data } = await api.get(`/chat/${chatId}/messages`);
      setMessages(data.messages || []);

      await api.post(`/chat/${chatId}/read`);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const createNewChat = async (userId: string) => {
    try {
      const { data } = await api.post('/chat', { participants: [userId] });
      setChats((prev) => [data.chat, ...prev]);
      handleSelectChat(data.chat);
    } catch (error: any) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat._id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      await api.post(`/chat/${selectedChat._id}/messages`, {
        content: newMessage.trim(),
      });

      setNewMessage('');
      await fetchMessages(selectedChat._id);
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (chat: Chat): ChatUser | null => {
    if (!currentUser) return chat.participants[0];
    return chat.participants.find((p) => p._id !== currentUser._id) || null;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 86400000) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter((chat) => {
    const other = getOtherParticipant(chat);
    if (!other) return true;
    const name = `${other.firstName} ${other.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400 mt-1">Messages from businesses will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredChats.map((chat) => {
                    const other = getOtherParticipant(chat);
                    const isSelected = selectedChat?._id === chat._id;

                    return (
                      <button
                        key={chat._id}
                        onClick={() => handleSelectChat(chat)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                          isSelected ? 'bg-primary-50' : ''
                        }`}
                      >
                        {other?.avatar ? (
                          <img src={other.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {other?.firstName?.charAt(0)}{other?.lastName?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {other?.firstName} {other?.lastName}
                            </h3>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {chat.lastMessage.senderId === currentUser?._id && 'You: '}
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  {(() => {
                    const other = getOtherParticipant(selectedChat);
                    return (
                      <>
                        {other?.avatar ? (
                          <img src={other.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {other?.firstName?.charAt(0)}{other?.lastName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {other?.firstName} {other?.lastName}
                          </h3>
                          <p className="text-xs text-gray-500">Business</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.senderId === currentUser?._id;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? 'text-primary-200' : 'text-gray-400'
                            }`}>
                              <span className="text-xs">{formatTime(message.createdAt)}</span>
                              {isOwn && (
                                message.read ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!newMessage.trim() || sending}
                      className="rounded-full px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a chat from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function InfluencerMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
