import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../../services/chatService';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  ChevronLeft,
  User,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Smile,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket, on, off, emit } = useSocket();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: () => chatAPI.getChatGroups().then((res) => res.data),
  });

  const groups = groupsData?.data || [];

  // Load messages when group selected
  useEffect(() => {
    if (!selectedGroup) return;

    const loadMessages = async () => {
      try {
        const { data } = await chatAPI.getMessages(selectedGroup._id);
        setMessages(data.data || []);
      } catch (error) {
        toast.error('Failed to load messages');
      }
    };
    loadMessages();

    // Join room
    emit('join_chat', selectedGroup._id);

    // Listen for new messages
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    on('new_message', handleNewMessage);

    return () => {
      off('new_message');
    };
  }, [selectedGroup, on, off, emit]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await chatAPI.sendMessage(selectedGroup._id, { content: newMessage });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedGroup) return;
    // In production, upload to Cloudinary first
    toast.success('File upload feature - integrate with Cloudinary');
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
        <p className="text-gray-500 mt-1">Communicate with your team</p>
      </div>

      <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Sidebar - Chat List */}
          <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredGroups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedGroup?._id === group._id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    {group.members?.some(m => m.isOnline) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.members?.length || 0} members</p>
                  </div>
                </button>
              ))}
              {filteredGroups.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No chats found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedGroup ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {selectedGroup.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedGroup.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedGroup.members?.filter(m => m.isOnline).length || 0} online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Phone className="w-5 h-5 text-gray-600" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Video className="w-5 h-5 text-gray-600" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender?._id === user?._id;
                  const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;

                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        {showAvatar && !isMe && (
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium flex-shrink-0">
                            {msg.sender?.name?.charAt(0)}
                          </div>
                        )}
                        {!showAvatar && !isMe && <div className="w-8 flex-shrink-0" />}

                        <div className={`px-4 py-2 rounded-2xl ${
                          isMe 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}>
                          {!isMe && showAvatar && (
                            <p className="text-xs font-medium mb-1 opacity-75">{msg.sender?.name}</p>
                          )}
                          {msg.content && <p className="text-sm">{msg.content}</p>}
                          {msg.attachments?.map((att, i) => (
                            <div key={i} className="mt-2 p-2 bg-white/20 rounded-lg">
                              <div className="flex items-center gap-2">
                                {att.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                <span className="text-xs">{att.name}</span>
                              </div>
                            </div>
                          ))}
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                            <span className="text-xs opacity-60">{formatTime(msg.createdAt)}</span>
                            {isMe && (
                              msg.isRead 
                                ? <CheckCheck className="w-3 h-3 opacity-60" /> 
                                : <Check className="w-3 h-3 opacity-60" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary-400" />
                </div>
                <p className="text-gray-500">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
