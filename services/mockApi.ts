import { UserProfile, UserRole, Spot, Drink, Invitation, InvitationStatus, Payment, PaymentStatus, ChatMessage, Moment, User } from '../types';

// --- MOCK HELPER ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- PLACEHOLDER IMAGES ---
const placeholderImages = [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc5445c?q=80&w=800',
    'https://images.unsplash.com/photo-1551024709-8f2379907814?q=80&w=800',
    'https://images.unsplash.com/photo-1543007818-272234d026d5?q=80&w=800',
    'https://images.unsplash.com/photo-1514362545857-3bc7dca47406?q=80&w=800',
    'https://images.unsplash.com/photo-1621269552303-9c35b0255869?q=80&w=800',
    'https://images.unsplash.com/photo-1550426322-6A3820204843?q=80&w=800',
    'https://images.unsplash.com/photo-1615887222829-31742b6355cf?q=80&w=800',
    'https://images.unsplash.com/photo-1597252033092-1ab6d551cb93?q=80&w=800',
    'https://images.unsplash.com/photo-1589830530460-159496e57e93?q=80&w=800',
    'https://images.unsplash.com/photo-1544463112-58a36418389d?q=80&w=800',
    'https://images.unsplash.com/photo-1571805126042-a72d16943a41?q=80&w=800',
];

export const getPlaceholderImage = (seed: string) => {
    const hash = seed.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const index = Math.abs(hash % placeholderImages.length);
    return placeholderImages[index];
};

// --- AVATAR GENERATION ---
const generateAvatar = (userName: string): string => {
    // AI avatar generation is now disabled. Always use a placeholder.
    console.log(`Using placeholder avatar for ${userName}.`);
    return getPlaceholderImage(userName);
};

// --- MOCK DATABASE (in-memory) ---

let USERS_DB: Record<string, UserProfile> = {
  'brocoder1': { id: 'brocoder1', name: 'Admin Bro', username: 'adminbro', email: 'hi@paujie.com', phone: '123-456-7890', role: UserRole.ADMIN, profile_pic_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNzUiIGZpbGw9IiM0RjQ2RTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjcwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkE8L3RleHQ+PC9zdmc+', location: 'Broville', date_of_birth: '1990-01-01' },
  'brocoder2': { id: 'brocoder2', name: 'Chad', username: 'chadwick', email: 'chad@test.com', phone: '111-222-3333', role: UserRole.USER, profile_pic_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNzUiIGZpbGw9IiMxMDlCRDQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjcwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkM8L3RleHQ+PC9zdmc+', location: 'Broville', date_of_birth: '1992-05-10' },
  'brocoder3': { id: 'brocoder3', name: 'Brenda', username: 'brenda', email: 'brenda@test.com', phone: '444-555-6666', role: UserRole.USER, profile_pic_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNzUiIGZpbGw9IiNEOTQ2OUMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjcwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkI8L3RleHQ+PC9zdmc+', location: 'Broville', date_of_birth: '1995-11-20' },
  'guest1': { id: 'guest1', name: 'Guest User', username: 'guesty', email: 'guest@test.com', phone: '777-888-9999', role: UserRole.GUEST, profile_pic_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNzUiIGZpbGw9IiM2QjczODciLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjcwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkc8L3RleHQ+PC9zdmc+', location: 'Broville', date_of_birth: '2000-03-15' },
};

let SPOTS: Spot[] = [
    { id: 'spot-1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), day: 'Friday', timing: '9:00 PM', budget: 50, location: 'The Downtown Pub', created_by: 'brocoder1', description: 'Let\'s kick off the weekend with some good drinks and company.' },
    { id: 'spot-2', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), day: 'Saturday', timing: '10:00 PM', budget: 60, location: 'The Old Cellar', created_by: 'brocoder1', feedback: 'Great vibe, but a bit pricey.' },
    { id: 'spot-3', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), day: 'Friday', timing: '8:00 PM', budget: 40, location: 'Rooftop Bar', created_by: 'brocoder1', feedback: 'Amazing views. Recommended.' },
];

let DRINKS: Drink[] = [
    { id: 'drink-1', spot_id: 'spot-1', name: 'Old Fashioned', image_url: placeholderImages[0], votes: 2, suggested_by: 'brocoder2', voted_by: ['brocoder2', 'brocoder1'], profiles: { name: 'Chad' } },
    { id: 'drink-2', spot_id: 'spot-1', name: 'Margarita', image_url: placeholderImages[1], votes: 1, suggested_by: 'brocoder3', voted_by: ['brocoder3'], profiles: { name: 'Brenda' } },
];

let INVITATIONS: Invitation[] = [
    { id: 'inv-1', spot_id: 'spot-1', user_id: 'brocoder1', profiles: USERS_DB['brocoder1'], status: InvitationStatus.CONFIRMED },
    { id: 'inv-2', spot_id: 'spot-1', user_id: 'brocoder2', profiles: USERS_DB['brocoder2'], status: InvitationStatus.CONFIRMED },
    { id: 'inv-3', spot_id: 'spot-1', user_id: 'brocoder3', profiles: USERS_DB['brocoder3'], status: InvitationStatus.PENDING },
    { id: 'inv-4', spot_id: 'spot-1', user_id: 'guest1', profiles: USERS_DB['guest1'], status: InvitationStatus.PENDING },
];

let PAYMENTS: Payment[] = [
    { id: 'pay-1', spot_id: 'spot-1', user_id: 'brocoder1', profiles: USERS_DB['brocoder1'], status: PaymentStatus.PAID },
    { id: 'pay-2', spot_id: 'spot-1', user_id: 'brocoder2', profiles: USERS_DB['brocoder2'], status: PaymentStatus.NOT_PAID },
    { id: 'pay-3', spot_id: 'spot-1', user_id: 'brocoder3', profiles: USERS_DB['brocoder3'], status: PaymentStatus.NOT_PAID },
];

let MESSAGES: ChatMessage[] = [
    { id: 'msg-1', user_id: 'brocoder3', content_image_urls: [placeholderImages[2], placeholderImages[3]], created_at: new Date(Date.now() - 5 * 60000).toISOString(), profiles: { name: 'Brenda', profile_pic_url: USERS_DB['brocoder3'].profile_pic_url! } },
    { id: 'msg-2', user_id: 'brocoder1', content_text: 'Hi peeps', created_at: new Date(Date.now() - 4 * 60000).toISOString(), profiles: { name: 'Admin Bro', profile_pic_url: USERS_DB['brocoder1'].profile_pic_url! } },
    { id: 'msg-3', user_id: 'brocoder2', content_text: 'Pls help me choose photos for insta post 🥺', created_at: new Date(Date.now() - 3 * 60000).toISOString(), profiles: { name: 'Chad', profile_pic_url: USERS_DB['brocoder2'].profile_pic_url! }, reactions: {'❤️': ['brocoder1'], '👍': ['brocoder3']} },
    { id: 'msg-4', user_id: 'brocoder3', content_text: 'come oooooonn', created_at: new Date(Date.now() - 2 * 60000).toISOString(), profiles: { name: 'Brenda', profile_pic_url: USERS_DB['brocoder3'].profile_pic_url! }, reactions: {'😮': ['brocoder1', 'brocoder2'], '😂': ['brocoder1']} },
    { id: 'msg-5', user_id: 'brocoder2', content_image_urls: placeholderImages, created_at: new Date(Date.now() - 1 * 60000).toISOString(), profiles: { name: 'Chad', profile_pic_url: USERS_DB['brocoder2'].profile_pic_url! } },
];

let MOMENTS: Moment[] = [
    { id: 'mom-1', user_id: 'brocoder1', image_url: placeholderImages[0], caption: 'Last week was a blast!', created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'mom-2', user_id: 'brocoder2', image_url: placeholderImages[1], caption: 'Good times.', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

// --- HELPER to ensure profile has a generated avatar ---
const ensureProfileAvatar = (profile: UserProfile): UserProfile => {
    // Check if the profile pic is missing or is the old SVG placeholder
    if (profile && (!profile.profile_pic_url || profile.profile_pic_url.startsWith('data:image/svg+xml'))) {
        const newAvatarUrl = generateAvatar(profile.name);
        // Update in-memory user object to cache the avatar for the session
        USERS_DB[profile.id] = { ...profile, profile_pic_url: newAvatarUrl };
        return USERS_DB[profile.id];
    }
    return profile;
};

// --- MOCK API FUNCTIONS ---

export const mockApi = {
    USERS: USERS_DB,
    // --- Auth ---
    async login(email: string, password: string): Promise<{ user: User, profile: UserProfile }> {
        await delay(500);
        const foundProfile = Object.values(USERS_DB).find(p => p.email === email);
        
        // Using a generic password check for any mocked user for demo purposes
        if (foundProfile && password === 'password') {
             const profile = ensureProfileAvatar(foundProfile);
             const user: User = { 
                 id: profile.id, 
                 email: profile.email, 
                 app_metadata: {}, 
                 user_metadata: {}, 
                 aud: 'authenticated', 
                 created_at: new Date().toISOString() 
            };
            return { user, profile };
        }
        throw new Error('Invalid credentials');
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        await delay(100);
        const profile = USERS_DB[userId];
        if (!profile) return null;
        
        return ensureProfileAvatar(profile);
    },
    
    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        await delay(300);
        USERS_DB[userId] = { ...USERS_DB[userId], ...updates };
        return USERS_DB[userId];
    },

    // --- Spots ---
    async getUpcomingSpot(): Promise<Spot | null> {
        await delay(400);
        const upcoming = SPOTS.filter(s => new Date(s.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return upcoming[0] || null;
    },

    async getPastSpots(): Promise<Spot[]> {
        await delay(400);
        return SPOTS.filter(s => new Date(s.date) < new Date()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    async getUserSpots(userId: string): Promise<Spot[]> {
        await delay(400);
        return SPOTS.filter(s => s.created_by === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
    },

    async createSpot(spotData: Omit<Spot, 'id'>): Promise<Spot> {
        await delay(500);
        const newSpot: Spot = { ...spotData, id: `spot-${Date.now()}` };
        SPOTS.push(newSpot);
        // Automatically create invitations and payments for all users for the new spot
        Object.values(USERS_DB).forEach(user => {
            INVITATIONS.push({ id: `inv-${Date.now()}-${user.id}`, spot_id: newSpot.id, user_id: user.id, profiles: user, status: user.id === spotData.created_by ? InvitationStatus.CONFIRMED : InvitationStatus.PENDING });
            PAYMENTS.push({ id: `pay-${Date.now()}-${user.id}`, spot_id: newSpot.id, user_id: user.id, profiles: user, status: PaymentStatus.NOT_PAID });
        });
        return newSpot;
    },

    // --- Drinks ---
    async getDrinks(spotId: string): Promise<Drink[]> {
        await delay(200);
        return DRINKS.filter(d => d.spot_id === spotId);
    },

    async suggestDrink(drinkData: Omit<Drink, 'id'>): Promise<Drink> {
        await delay(300);
        const suggester = USERS_DB[drinkData.suggested_by];
        const newDrink: Drink = { ...drinkData, id: `drink-${Date.now()}`, image_url: placeholderImages[Math.floor(Math.random() * placeholderImages.length)], profiles: { name: suggester.name } };
        DRINKS.push(newDrink);
        return newDrink;
    },

    async updateVote(drinkId: string, userId: string): Promise<Drink> {
        await delay(100);
        const drink = DRINKS.find(d => d.id === drinkId);
        if (!drink) throw new Error("Drink not found");

        const hasVoted = drink.voted_by.includes(userId);
        if (hasVoted) {
            drink.voted_by = drink.voted_by.filter(id => id !== userId);
        } else {
            drink.voted_by.push(userId);
        }
        drink.votes = drink.voted_by.length;
        return drink;
    },

    // --- Invitations ---
    async getInvitations(spotId: string): Promise<Invitation[]> {
        await delay(200);
        return INVITATIONS.filter(i => i.spot_id === spotId);
    },
    
    async updateInvitationStatus(invitationId: string, status: InvitationStatus): Promise<Invitation> {
        await delay(200);
        const invitation = INVITATIONS.find(i => i.id === invitationId);
        if (!invitation) throw new Error("Invitation not found");
        invitation.status = status;
        return invitation;
    },

    // --- Payments ---
    async getPayments(spotId: string): Promise<Payment[]> {
        await delay(300);
        return PAYMENTS.filter(p => p.spot_id === spotId);
    },
    
    async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<Payment> {
        await delay(300);
        const payment = PAYMENTS.find(p => p.id === paymentId);
        if (!payment) throw new Error("Payment not found");
        payment.status = status;
        return payment;
    },

    // --- Chat ---
    async getMessages(): Promise<ChatMessage[]> {
        await delay(500);
        // Ensure all users in messages have up-to-date profile pics
        for (const msg of MESSAGES) {
            const user = USERS_DB[msg.user_id];
            if (user) {
                const updatedUser = ensureProfileAvatar(user);
                msg.profiles.profile_pic_url = updatedUser.profile_pic_url;
            }
        }
        return MESSAGES;
    },

    async sendMessage(message: { user_id: string, content_text?: string | null, content_image_urls?: string[] }): Promise<ChatMessage> {
        await delay(300);
        const author = USERS_DB[message.user_id];
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            created_at: new Date().toISOString(),
            ...message,
            profiles: { name: author.name, profile_pic_url: author.profile_pic_url },
        };
        MESSAGES.push(newMessage);
        return newMessage;
    },
    
    async addReaction(messageId: string, emoji: string, userId: string): Promise<ChatMessage> {
        await delay(150);
        const message = MESSAGES.find(m => m.id === messageId);
        if (!message) throw new Error("Message not found");

        if (!message.reactions) {
            message.reactions = {};
        }

        if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
        }

        const userIndex = message.reactions[emoji].indexOf(userId);
        if (userIndex > -1) {
            message.reactions[emoji].splice(userIndex, 1);
            if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
            }
        } else {
            message.reactions[emoji].push(userId);
        }
        return message;
    },

    // --- Moments ---
    async getMoments(userId: string): Promise<Moment[]> {
        await delay(400);
        return MOMENTS.filter(m => m.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    async createMoment(momentData: Omit<Moment, 'id' | 'created_at'>): Promise<Moment> {
        await delay(500);
        const newMoment: Moment = { ...momentData, id: `moment-${Date.now()}`, created_at: new Date().toISOString() };
        MOMENTS.unshift(newMoment);
        return newMoment;
    },
    
    async deleteMoment(momentId: string): Promise<void> {
        await delay(500);
        MOMENTS = MOMENTS.filter(m => m.id !== momentId);
    },
};