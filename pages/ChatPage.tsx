import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../services/mockApi';
import { ChatMessage, UserRole } from '../types';
// FIX: Removed non-existent `Surprised` icon and other unused icons.
import { ArrowLeft, Video, Plus, Send, X, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const PhotoGallery: React.FC<{ urls: string[] }> = ({ urls }) => {
    if (urls.length === 0) return null;

    const renderImages = () => {
        const displayedUrls = urls.slice(0, 4);
        return displayedUrls.map((url, index) => (
            <div
                key={index}
                className={`relative group ${urls.length === 3 && index === 0 ? 'row-span-2' : ''}`}
            >
                <img src={url} alt={`chat-img-${index}`} className="w-full h-full object-cover rounded-md" />
                 {urls.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">+{urls.length - 4}</span>
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div
            className={`grid gap-1 rounded-md overflow-hidden max-w-xs ${
                urls.length === 1 ? 'grid-cols-1' :
                urls.length === 2 ? 'grid-cols-2 aspect-[2/1]' :
                urls.length === 3 ? 'grid-cols-2 grid-rows-2 aspect-square' :
                'grid-cols-2 grid-rows-2 aspect-square'
            }`}
        >
            {renderImages()}
        </div>
    );
};

const ReactionPicker: React.FC<{ onSelect: (emoji: string) => void }> = ({ onSelect }) => {
    const reactions = ['👍', '❤️', '😂', '😮', '😠'];
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-2 flex items-center gap-1 bg-zinc-800 p-1.5 rounded-full shadow-lg border border-zinc-700"
        >
            {reactions.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="p-1.5 rounded-full text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </motion.div>
    );
};

// A list of mock responses for simulation
const mockResponses = [
    "lol that's hilarious 😂",
    "I agree!",
    "No way, really?",
    "That's a great idea.",
    "I'm not so sure about that.",
    "🔥🔥🔥",
    "See you there!",
];


const ChatPage: React.FC = () => {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [reactingTo, setReactingTo] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const canChat = profile?.role === UserRole.ADMIN || profile?.role === UserRole.USER;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mockApi.getMessages();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);
    
    useEffect(scrollToBottom, [messages]);
    
    // Simulate receiving new messages from other users
    useEffect(() => {
        // Don't run simulation if still loading, user can't chat, or user data is not available yet.
        if (loading || !canChat || !user) {
            return;
        }

        // Get a list of users who can send simulated messages (not the current user or guests).
        const otherUserIds = Object.keys(mockApi.USERS).filter(
            id => id !== user.id && mockApi.USERS[id].role !== UserRole.GUEST
        );
        
        // If there are no other users to simulate messages from, don't start the interval.
        if (otherUserIds.length === 0) return;

        const interval = setInterval(() => {
            // Pick a random user to send a message.
            const randomUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];
            const senderProfile = mockApi.USERS[randomUserId];

            // Pick a random message.
            const randomMessageText = mockResponses[Math.floor(Math.random() * mockResponses.length)];

            // Construct the new message object.
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
            
            // Update the state to add the new message.
            setMessages(prevMessages => [...prevMessages, newMockMessage]);

        }, 8000); // Receive a new message every 8 seconds.

        // Cleanup interval on component unmount.
        return () => clearInterval(interval);

    }, [loading, canChat, user]); // Rerun effect if loading/canChat/user changes.


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newPreviews: string[] = [];
            // FIX: Add explicit type annotation `(file: File)` to prevent `file` from being inferred as `unknown`.
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === files.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const removeImagePreview = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && imagePreviews.length === 0) || !user) return;
        setSending(true);

        try {
            const sentMessage = await mockApi.sendMessage({
                user_id: user.id,
                content_text: newMessage.trim() || undefined,
                content_image_urls: imagePreviews.length > 0 ? imagePreviews : undefined,
            });

            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            setImagePreviews([]);
        } catch (error: any) {
            console.error('Failed to send message:', error.message);
            alert('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        if (!user) return;
        setReactingTo(null);

        // Optimistic update
        const originalMessages = [...messages];
        // FIX: Refactored to use immutable updates for reactions to prevent state mutation bugs and fix type errors.
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
            // The API call returns the updated message, we could re-fetch or trust optimistic update.
            // For now, we trust the optimistic update.
        } catch (error) {
            console.error("Failed to add reaction:", error);
            setMessages(originalMessages); // Revert on error
            alert("Failed to add reaction.");
        }
    };
    
    return (
        <div className="h-full flex flex-col bg-black text-white">
            <header className="flex items-center justify-between p-3 border-b border-zinc-800 bg-black z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-zinc-800">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex items-center">
                         {['brocoder3','brocoder2','brocoder1'].map((u, i) => (
                           <img key={u} src={mockApi.USERS[u].profile_pic_url} alt="user" className={`w-8 h-8 rounded-full border-2 border-black ${i > 0 ? '-ml-3' : ''}`} />
                        ))}
                    </div>
                    <div>
                        <h2 className="font-bold text-base leading-tight">gucci fans</h2>
                        <p className="text-xs text-zinc-400 leading-tight">3 online</p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-zinc-800">
                    <Video size={20} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-6">
                    {loading && <p className="text-center text-zinc-400">Loading messages...</p>}
                    <AnimatePresence initial={false}>
                        {messages.map(msg => {
                            const isCurrentUser = msg.user_id === user?.id;
                            return (
                                <motion.div
                                    key={msg.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    className={`flex w-full items-start gap-3 group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isCurrentUser && (
                                            <img src={msg.profiles.profile_pic_url} alt={msg.profiles.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                        )}
                                        
                                        <div className={`flex flex-col max-w-sm relative ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                             <div className={`bg-white text-black py-2 px-3.5 rounded-2xl ${isCurrentUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                                                {msg.content_image_urls && (
                                                   <div className={msg.content_text ? 'mb-2' : ''}>
                                                        <PhotoGallery urls={msg.content_image_urls} />
                                                   </div>
                                                )}
                                                {msg.content_text && <p className="whitespace-pre-wrap text-sm leading-snug">{msg.content_text}</p>}
                                                <div className="text-right text-xs text-zinc-400 mt-1">
                                                    {format(new Date(msg.created_at), 'p')}
                                                </div>
                                             </div>
                                            
                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div className="flex items-center gap-1 mt-1.5 px-1">
                                                    {Object.entries(msg.reactions).map(([emoji, userIds]) => userIds.length > 0 && (
                                                        <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${userIds.includes(user?.id || '') ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'bg-zinc-700/50 border-zinc-700/80 text-zinc-300'}`}>
                                                            <span>{emoji}</span>
                                                            <span className="font-semibold">{userIds.length}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {reactingTo === msg.id && <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji)} />}

                                            <div className={`absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser ? '-left-2' : '-right-2'}`}>
                                                 <button onClick={() => setReactingTo(reactingTo === msg.id ? null : msg.id)} className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700">
                                                    <Smile size={16} className="text-zinc-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-2 bg-black border-t border-zinc-800">
                {canChat ? (
                    <form onSubmit={handleSendMessage}>
                         {imagePreviews.length > 0 && (
                            <div className="p-2 flex items-center gap-2 overflow-x-auto">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative flex-shrink-0">
                                        <img src={src} alt="preview" className="h-16 w-16 object-cover rounded"/>
                                        <button type="button" onClick={() => removeImagePreview(i)} className="absolute -top-1 -right-1 bg-black rounded-full p-0.5"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center p-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-zinc-400 hover:text-white" aria-label="Attach file">
                                <Plus size={24} className="bg-zinc-700 rounded-full p-1" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
                           
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Send a message"
                                className="flex-1 bg-transparent text-white px-3 focus:outline-none"
                                disabled={sending}
                            />
                            
                            <button type="submit" disabled={sending || (!newMessage.trim() && imagePreviews.length === 0)} className="p-2 text-zinc-400 hover:text-white disabled:text-zinc-600" aria-label="Send message">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                ) : (
                     <div className="text-center text-zinc-500 text-sm p-3 bg-zinc-900 rounded-lg">
                        Chat is only available for Admins and Users.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;