import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { ChatMessage, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../services/mockApi';

const mockResponses = [
    "lol that's hilarious 😂", "I agree!", "No way, really?", "That's a great idea.", "I'm not so sure about that.", "🔥🔥🔥", "See you there!",
];

interface ChatContextType {
  messages: ChatMessage[];
  unreadCount: number;
  loading: boolean;
  sendMessage: (message: { content_text?: string | null, content_image_urls?: string[] }) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  setChatActive: (isActive: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatActive, setIsChatActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getMessages().then(data => {
      setMessages(data);
      setLoading(false);
    });
  }, []);
  
  useEffect(() => {
    if (loading || !user) return;

    const otherUserIds = Object.keys(mockApi.USERS).filter(
        id => id !== user.id && mockApi.USERS[id].role !== UserRole.GUEST
    );
    if (otherUserIds.length === 0) return;

    const interval = setInterval(() => {
      const randomUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];
      const senderProfile = mockApi.USERS[randomUserId];
      const randomMessageText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const newMockMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        user_id: senderProfile.id,
        content_text: randomMessageText,
        created_at: new Date().toISOString(),
        profiles: {
          name: senderProfile.name,
          profile_pic_url: senderProfile.profile_pic_url,
        },
      };
      
      setMessages(prev => [...prev, newMockMessage]);

      if (!isChatActive) {
        setUnreadCount(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, user, isChatActive]);

  const setChatActive = (isActive: boolean) => {
    setIsChatActive(isActive);
    if (isActive) {
      setUnreadCount(0);
    }
  };

  const sendMessage = async (messageData: { content_text?: string | null, content_image_urls?: string[] }) => {
    if (!user) throw new Error("User not found");
    const sentMessage = await mockApi.sendMessage({ user_id: user.id, ...messageData });
    setMessages(prev => [...prev, sentMessage]);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    const originalMessages = [...messages];
    const updatedMessages = messages.map(msg => {
        if (msg.id === messageId) {
            const reactions = { ...(msg.reactions || {}) };
            const userList: string[] = reactions[emoji] || [];
            
            const userIndex = userList.indexOf(user.id);
            if (userIndex > -1) {
                const newUserList = userList.filter(id => id !== user.id);
                if (newUserList.length > 0) {
                    reactions[emoji] = newUserList;
                } else {
                    delete reactions[emoji];
                }
            } else {
                reactions[emoji] = [...userList, user.id];
            }
            return { ...msg, reactions };
        }
        return msg;
    });
    setMessages(updatedMessages);

    try {
        await mockApi.addReaction(messageId, emoji, user.id);
    } catch (error) {
        console.error("Failed to add reaction:", error);
        setMessages(originalMessages);
    }
  };

  const value = { messages, unreadCount, sendMessage, addReaction, setChatActive, loading };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};