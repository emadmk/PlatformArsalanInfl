'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';
import {
  Search,
  MessageSquare,
  Eye,
  Trash2,
  Ban,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ChatParticipant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profile?: {
    avatar?: string;
    companyName?: string;
  };
}

interface Chat {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  projectId?: {
    _id: string;
    title: string;
  };
  status: 'active' | 'suspended' | 'deleted';
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  read: boolean;
  createdAt: string;
}

function AdminChatsContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'unsuspend' | 'delete'>('suspend');
  const [actionLoading, setActionLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stats
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    suspendedChats: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    fetchChats();
    fetchStats();
  }, [page, statusFilter]);

  useEffect(() => {
    // If a user ID was provided in URL, open admin chat with that user
    if (targetUserId) {
      handleStartAdminChat(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (showChatModal && selectedChat) {
      scrollToBottom();
    }
  }, [messages, showChatModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10, sort: '-updatedAt' };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get('/admin/chats', { params });
      setChats(data.chats || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/chats/stats');
      setStats({
        totalChats: data.totalChats || 0,
        activeChats: data.activeChats || 0,
        suspendedChats: data.suspendedChats || 0,
        totalMessages: data.totalMessages || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/admin/chats/${chatId}/messages`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchChats();
  };

  const handleViewChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
    await fetchMessages(chat._id);
  };

  const handleStartAdminChat = async (userId: string) => {
    try {
      const { data } = await api.post('/admin/chats/create', { userId });
      setSelectedChat(data.chat);
      setShowChatModal(true);
      await fetchMessages(data.chat._id);
    } catch (error: any) {
      console.error('Error starting admin chat:', error);
      alert(error.response?.data?.error || 'Failed to start chat');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSendingMessage(true);
      await api.post(`/admin/chats/${selectedChat._id}/messages`, {
        content: newMessage,
        type: 'text',
      });
      setNewMessage('');
      await fetchMessages(selectedChat._id);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const openActionModal = (chat: Chat, action: 'suspend' | 'unsuspend' | 'delete') => {
    setSelectedChat(chat);
    setActionType(action);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedChat) return;

    try {
      setActionLoading(true);

      if (actionType === 'suspend') {
        await api.put(`/admin/chats/${selectedChat._id}/suspend`);
      } else if (actionType === 'unsuspend') {
        await api.put(`/admin/chats/${selectedChat._id}/unsuspend`);
      } else if (actionType === 'delete') {
        await api.delete(`/admin/chats/${selectedChat._id}`);
      }

      setShowActionModal(false);
      setSelectedChat(null);
      fetchChats();
      fetchStats();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageDate = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
      suspended: 'danger',
      deleted: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const getParticipantNames = (chat: Chat) => {
    return chat.participants
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(' & ');
  };

  return (
    <>
      <AdminNavbar />
      <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Chat Management</h1>
              <p className="text-slate-400 mt-1">
                View and manage all platform conversations
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Chats</p>
                    <p className="text-2xl font-bold text-white">{stats.totalChats}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Chats</p>
                    <p className="text-2xl font-bold text-white">{stats.activeChats}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Suspended</p>
                    <p className="text-2xl font-bold text-white">{stats.suspendedChats}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Messages</p>
                    <p className="text-2xl font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Chats Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No chats found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Last Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {chats.map((chat) => (
                        <tr key={chat._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                {chat.participants.slice(0, 2).map((p, i) => (
                                  <div
                                    key={p._id}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-slate-900"
                                    style={{ zIndex: 2 - i }}
                                  >
                                    {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">
                                  {getParticipantNames(chat)}
                                </p>
                                {chat.projectId && (
                                  <p className="text-slate-500 text-xs truncate max-w-[200px]">
                                    Project: {chat.projectId.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {chat.lastMessage ? (
                              <p className="text-slate-400 text-sm max-w-[200px] truncate">
                                {chat.lastMessage.content}
                              </p>
                            ) : (
                              <span className="text-slate-500 text-sm">No messages</span>
                            )}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(chat.status)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {chat.messageCount || 0}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {formatDate(chat.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewChat(chat)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="View Messages"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {chat.status === 'suspended' ? (
                                <button
                                  onClick={() => openActionModal(chat, 'unsuspend')}
                                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Unsuspend"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openActionModal(chat, 'suspend')}
                                  className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Suspend"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => openActionModal(chat, 'delete')}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">
                    Page {page} of {totalPages} ({total} chats)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat View Modal */}
      {showChatModal && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl mx-4 h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {selectedChat.participants.slice(0, 2).map((p, i) => (
                    <div
                      key={p._id}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-900"
                      style={{ zIndex: 2 - i }}
                    >
                      {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {getParticipantNames(selectedChat)}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {selectedChat.messageCount || 0} messages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No messages yet
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender.role === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.sender.role === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {message.sender.role !== 'admin' && (
                        <p className="text-xs text-slate-400 mb-1">
                          {message.sender.firstName} {message.sender.lastName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender.role === 'admin' ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message as Admin..."
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="secondary"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'suspend' && 'Suspend Chat'}
                {actionType === 'unsuspend' && 'Unsuspend Chat'}
                {actionType === 'delete' && 'Delete Chat'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-300 mb-4">
                {actionType === 'suspend' && (
                  <>
                    Are you sure you want to suspend this chat between{' '}
                    <strong className="text-white">{getParticipantNames(selectedChat)}</strong>?
                    Users will not be able to send messages.
                  </>
                )}
                {actionType === 'unsuspend' && (
                  <>
                    Are you sure you want to unsuspend this chat between{' '}
                    <strong className="text-white">{getParticipantNames(selectedChat)}</strong>?
                    Users will be able to send messages again.
                  </>
                )}
                {actionType === 'delete' && (
                  <>
                    Are you sure you want to permanently delete this chat between{' '}
                    <strong className="text-white">{getParticipantNames(selectedChat)}</strong>?
                    All messages will be lost.
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowActionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'unsuspend' ? 'secondary' : 'danger'}
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : (
                  <>
                    {actionType === 'suspend' && 'Suspend'}
                    {actionType === 'unsuspend' && 'Unsuspend'}
                    {actionType === 'delete' && 'Delete'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminChatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <AdminChatsContent />
    </Suspense>
  );
}
