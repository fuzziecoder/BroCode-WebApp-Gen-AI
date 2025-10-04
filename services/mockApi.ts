import { UserProfile, UserRole, Spot, Drink, Invitation, InvitationStatus, Payment, PaymentStatus, ChatMessage, Moment, User } from '../types';
import axios from 'axios';

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

// --- DEFAULT AVATARS ---
export const DEFAULT_AVATARS = [
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzgpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMV84IiB4MT0iMCIgeTE9IjAiIHgyPSIxMjAiIHkyPSIxMjAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzI5OERCRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxQTQyNzUiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzEwKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMTAiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRjBDOEFFIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0E1M0Q4NyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzEyKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMTIiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkZBMjZCIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0Y0NTY0OSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzE0KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMTQiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNTNFNEYyIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE2OEI4MiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzE2KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMTYiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRjc3OTdGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RGNEMxRSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzE4KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMTgiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQzM3M0Y5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzdBNEFDRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzIwKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMjAiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjM0FEQjgwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE2NzY1QiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzIyKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzFfMjIiIHgxPSIwIiB5MT0iMCIgeDI9IjEyMCIgeTI9IjEyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRDU1Q0M4Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0FBM0M5QiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
];


// --- MOCK DATABASE (in-memory) ---

let USERS_DB: Record<string, UserProfile> = {
  'brocoder1': { id: 'brocoder1', name: 'Admin Bro', username: 'adminbro', email: 'hi@paujie.com', phone: '123-456-7890', role: UserRole.ADMIN, profile_pic_url: DEFAULT_AVATARS[0], location: 'Broville', date_of_birth: '1990-01-01', password: 'password', isVerified: true, latitude: 37.7853, longitude: -122.4039 },
  'brocoder2': { id: 'brocoder2', name: 'Chad', username: 'chadwick', email: 'chad@test.com', phone: '111-222-3333', role: UserRole.USER, profile_pic_url: DEFAULT_AVATARS[1], location: 'Broville', date_of_birth: '1992-05-10', password: 'password', isVerified: true, latitude: 37.7880, longitude: -122.4074 },
  'brocoder3': { id: 'brocoder3', name: 'Brenda', username: 'brenda', email: 'brenda@test.com', phone: '444-555-6666', role: UserRole.USER, profile_pic_url: DEFAULT_AVATARS[2], location: 'Broville', date_of_birth: '1995-11-20', password: 'password', isVerified: true, latitude: 37.7749, longitude: -122.4194 },
  'guest1': { id: 'guest1', name: 'Guest User', username: 'guesty', email: 'guest@test.com', phone: '777-888-9999', role: UserRole.GUEST, profile_pic_url: DEFAULT_AVATARS[3], location: 'Broville', date_of_birth: '2000-03-15', password: 'password', isVerified: true },
};

let SPOTS: Spot[] = [
    { id: 'spot-1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), day: 'Friday', timing: '9:00 PM', budget: 50, location: 'The Downtown Pub', created_by: 'brocoder1', description: 'Let\'s kick off the weekend with some good drinks and company.', latitude: 37.7853, longitude: -122.4039 },
    { id: 'spot-2', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), day: 'Saturday', timing: '10:00 PM', budget: 60, location: 'The Old Cellar', created_by: 'brocoder1', feedback: 'Great vibe, but a bit pricey.', latitude: 37.773972, longitude: -122.431297 },
    { id: 'spot-3', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), day: 'Friday', timing: '8:00 PM', budget: 40, location: 'Rooftop Bar', created_by: 'brocoder1', feedback: 'Amazing views. Recommended.', latitude: 37.7914, longitude: -122.4228 },
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

const MOCK_FAST2SMS_API_KEY = 'your_fast2sms_api_key_here';
const fast2smsApiKey = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FAST2SMS_API_KEY) || MOCK_FAST2SMS_API_KEY;

// --- MOCK API FUNCTIONS ---

export const mockApi = {
    USERS: USERS_DB,
    // --- Auth ---
    async login(identifier: string, password: string): Promise<{ user: User, profile: UserProfile }> {
        await delay(500);
        const isEmail = identifier.includes('@');
        const foundProfile = Object.values(USERS_DB).find(p => 
            isEmail ? (p.email === identifier) : (p.phone === identifier)
        );
        
        if (foundProfile && password === foundProfile.password && foundProfile.isVerified) {
             const user: User = { 
                 id: foundProfile.id, 
                 email: foundProfile.email, 
                 app_metadata: {}, 
                 user_metadata: {}, 
                 aud: 'authenticated', 
                 created_at: new Date().toISOString() 
            };
            return { user, profile: foundProfile };
        }
        throw new Error('Invalid credentials or user not verified.');
    },

    async sendMobileOtp(mobile: string): Promise<void> {
        await delay(500);

        /*
        // --- REAL OTP IMPLEMENTATION (Fast2SMS) ---
        // NOTE: This is commented out because it requires a backend to securely store the API key.
        // Exposing API keys on the frontend is a major security risk. A real implementation would
        // involve a server-side function to handle this call and protect the API key.
        
        try {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit OTP
            const response = await axios.post(
              "https://www.fast2sms.com/dev/bulkV2",
              {
                route: "otp",
                variables_values: generatedOtp,
                numbers: mobile,
              },
              {
                headers: {
                  authorization: fast2smsApiKey, // This key should be stored on a server, not here.
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.data.return) {
                // Fast2SMS API returns 'return: false' on failure.
                throw new Error(response.data.message || 'Failed to send OTP via Fast2SMS.');
            }

            console.log('Successfully sent OTP via Fast2SMS:', response.data);
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
            
            // The rest of the logic to save the `generatedOtp` and `otpExpiry` to the user profile would go here.
            // For now, we proceed with the mock flow below.

        } catch (error: any) {
            console.error("Fast2SMS API Error:", error.response ? error.response.data : error.message);
            // Fallback to mock logic or throw an error to the user.
            throw new Error('Failed to send verification code. Please try again later.');
        }
        */

        let user = Object.values(USERS_DB).find(u => u.phone === mobile);
        if (user && user.isVerified) {
            throw new Error('An account with this mobile number already exists.');
        }
        
        const otp = '123456'; // Mock OTP for testing
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    
        if (user) { // User exists but not verified
            USERS_DB[user.id] = { ...user, otp, otpExpiry: otpExpiry.toISOString() };
        } else { // New user
            const newUserId = `brocoder${Object.keys(USERS_DB).length + 1}`;
            const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
            const newUser: UserProfile = {
                id: newUserId,
                name: `New Bro #${newUserId.slice(-1)}`,
                username: `newbro${newUserId.slice(-1)}`,
                phone: mobile,
                role: UserRole.USER,
                profile_pic_url: randomAvatar,
                location: 'Broville',
                isVerified: false,
                otp,
                otpExpiry: otpExpiry.toISOString(),
            };
            USERS_DB[newUserId] = newUser;
        }
        console.log(`MOCK: OTP for ${mobile} is "${otp}". This would be sent via SMS in a real app.`);
        return;
    },
    
    async verifyOtp(mobile: string, otp: string): Promise<UserProfile> {
        await delay(500);
        const userProfile = Object.values(USERS_DB).find(u => u.phone === mobile);
        
        if (!userProfile) throw new Error('User not found.');
        if (userProfile.otp !== otp || (userProfile.otpExpiry && new Date(userProfile.otpExpiry) < new Date())) {
            throw new Error('Invalid or expired OTP.');
        }
    
        userProfile.isVerified = true;
        userProfile.otp = undefined;
        userProfile.otpExpiry = undefined;
        USERS_DB[userProfile.id] = userProfile;
    
        return userProfile;
    },
    
    async completeRegistration(mobile: string, data: { name: string, username: string, password: string, profile_pic_url: string }): Promise<UserProfile> {
        await delay(500);
        const userProfile = Object.values(USERS_DB).find(u => u.phone === mobile);
        if (!userProfile) throw new Error('User not found.');

        userProfile.name = data.name;
        userProfile.username = data.username;
        userProfile.password = data.password;
        userProfile.profile_pic_url = data.profile_pic_url;

        USERS_DB[userProfile.id] = userProfile;
        return userProfile;
    },

    async sendPasswordResetOtp(email: string): Promise<void> {
        await delay(500);
        const foundProfile = Object.values(USERS_DB).find(p => p.email === email);
        if (foundProfile) {
            console.log(`MOCK: OTP for ${email} is "123456". This would be sent via email/SMS in a real app.`);
            return;
        }
        throw new Error('No account found with that email address.');
    },

    async resetPassword(email: string, newPassword: string): Promise<void> {
        await delay(500);
        const userKey = Object.keys(USERS_DB).find(key => USERS_DB[key].email === email);
        if (userKey) {
            USERS_DB[userKey].password = newPassword;
            console.log(`MOCK: Password for ${email} has been updated to "${newPassword}".`);
            return;
        }
        throw new Error('Failed to reset password for the given email.');
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        await delay(100);
        const profile = USERS_DB[userId];
        return profile || null;
    },
    
    async getAllUsers(): Promise<UserProfile[]> {
        await delay(200);
        return Object.values(USERS_DB);
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        await delay(300);
        USERS_DB[userId] = { ...USERS_DB[userId], ...updates };
        return USERS_DB[userId];
    },
    
    async updateUserLocation(userId: string, coords: { lat: number, lng: number }): Promise<UserProfile> {
        await delay(50); // very short delay for location updates
        const user = USERS_DB[userId];
        if (user) {
            user.latitude = coords.lat;
            user.longitude = coords.lng;
            return user;
        }
        throw new Error("User not found");
    },

    // --- Spots ---
    async getUpcomingSpot(): Promise<Spot | null> {
        await delay(400);
        const upcoming = SPOTS
            .filter(s => new Date(s.date) >= new Date())
            .filter(s => {
                const creator = USERS_DB[s.created_by];
                return creator?.role === UserRole.ADMIN;
            })
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        
        // Invite only the creator when a new spot is made.
        const creator = USERS_DB[spotData.created_by];
        if (creator) {
             INVITATIONS.push({ 
                 id: `inv-${Date.now()}-${creator.id}`, 
                 spot_id: newSpot.id, 
                 user_id: creator.id, 
                 profiles: creator, 
                 status: InvitationStatus.CONFIRMED 
            });
            PAYMENTS.push({ 
                id: `pay-${Date.now()}-${creator.id}`, 
                spot_id: newSpot.id, 
                user_id: creator.id, 
                profiles: creator, 
                status: PaymentStatus.NOT_PAID 
            });
        }
        
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
    
    async inviteUserToSpot(spotId: string, userId: string): Promise<Invitation> {
        await delay(300);
        const user = USERS_DB[userId];
        if (!user) throw new Error("User not found");
        
        const existingInvitation = INVITATIONS.find(inv => inv.spot_id === spotId && inv.user_id === userId);
        if (existingInvitation) throw new Error("User is already invited to this spot");
    
        const newInvitation: Invitation = {
            id: `inv-${Date.now()}-${user.id}`,
            spot_id: spotId,
            user_id: user.id,
            profiles: user,
            status: InvitationStatus.PENDING
        };
        INVITATIONS.push(newInvitation);
    
        const newPayment: Payment = {
            id: `pay-${Date.now()}-${user.id}`,
            spot_id: spotId,
            user_id: user.id,
            profiles: user,
            status: PaymentStatus.NOT_PAID
        };
        PAYMENTS.push(newPayment);
        
        return newInvitation;
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