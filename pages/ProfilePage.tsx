
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Spot, Moment } from '../types';
import { ArrowLeft, MoreHorizontal, Gift, Plus, Image as ImageIcon, X, Trash2 } from 'lucide-react';
// FIX: Use namespace import for react-router-dom to address potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { differenceInYears, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import GlowButton from '../components/common/GlowButton';
import { mockApi, getPlaceholderImage } from '../services/mockApi';
import Textarea from '../components/common/Textarea';
import AvatarPicker from '../components/common/AvatarPicker';

type ProfileFormData = {
    name: string;
    phone: string;
    location: string;
    profile_pic_url: string;
};

// --- Re-usable ProfileForm for editing profile ---
const ProfileForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { profile, updateProfile } = useAuth();
    const [formData, setFormData] = useState<ProfileFormData>({
        name: profile?.name || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        profile_pic_url: profile?.profile_pic_url || '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                phone: profile.phone,
                location: profile.location,
                profile_pic_url: profile.profile_pic_url || '',
            });
        }
    }, [profile]);
    
    const validateField = (name: keyof Omit<ProfileFormData, 'profile_pic_url'>, value: string): string => {
        let error = '';
        if (!value.trim()) {
            error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
        } else if (name === 'phone' && !/^\d{10}$|^\d{3}-?\d{3}-?\d{4}$/.test(value.replace(/[\s-]/g, ''))) {
            error = 'Invalid phone number format.';
        }
        return error;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof ProfileFormData, value: string };
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof Omit<ProfileFormData, 'profile_pic_url'>]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name as keyof Omit<ProfileFormData, 'profile_pic_url'>, value) }));
        }
    };
    
    const handleAvatarChange = (url: string) => {
        setFormData(prev => ({ ...prev, profile_pic_url: url }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof Omit<ProfileFormData, 'profile_pic_url'>, value: string };
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        setSuccess('');

        const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        let isValid = true;
        (['name', 'phone', 'location'] as const).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => onSave(), 1000);
        } catch (err: any) {
             setApiError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AvatarPicker label="Choose Avatar" initialValue={formData.profile_pic_url} onChange={handleAvatarChange} />
            <Input id="name" name="name" label="Full Name" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} required />
            <Input id="phone" name="phone" label="Phone" type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} required />
            <Input id="location" name="location" label="Location" value={formData.location} onChange={handleChange} onBlur={handleBlur} error={errors.location} required />

            {apiError && <p className="text-sm text-red-500">{apiError}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};

// --- Form for creating a new Moment ---
const MomentForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { user } = useAuth();
    const [caption, setCaption] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ image: '', caption: '' });

    const validate = (): boolean => {
        const newErrors = { image: '', caption: '' };
        let isValid = true;
        if (!imagePreview) {
            newErrors.image = 'An image is required.';
            isValid = false;
        }
        if (caption.length > 280) {
            newErrors.caption = 'Caption cannot exceed 280 characters.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                 setErrors(prev => ({ ...prev, image: '' }));
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCaption(e.target.value);
        if (errors.caption) {
            setErrors(prev => ({ ...prev, caption: e.target.value.length > 280 ? 'Caption cannot exceed 280 characters.' : '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !user) return;

        setLoading(true);
        try {
            await mockApi.createMoment({
                user_id: user.id,
                image_url: imagePreview!,
                caption,
            });
            // Reset form state before closing
            setCaption('');
            setImagePreview(null);
            setErrors({ image: '', caption: '' });
            onSave();
        } catch (err: any) {
            setErrors(prev => ({...prev, image: err.message || 'Failed to create moment.'}));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
                <label htmlFor="moment-image" className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                {imagePreview ? (
                    <div className="relative group">
                         <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                         <button 
                            type="button" 
                            onClick={() => { setImagePreview(null); }}
                            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                         >
                             <X size={16} />
                         </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="moment-image" className={`flex flex-col items-center justify-center w-full h-32 border-2 ${errors.image ? 'border-red-500/70' : 'border-gray-600'} border-dashed rounded-lg cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-colors`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                            </div>
                            <input id="moment-image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div> 
                )}
                 <AnimatePresence>
                    {errors.image && (
                        <motion.p
                            className="mt-1.5 text-xs text-red-400"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                        >
                            {errors.image}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <Textarea 
                id="caption" 
                label="Caption" 
                rows={3} 
                value={caption} 
                onChange={handleCaptionChange}
                placeholder="Add a caption..."
                error={errors.caption}
            />

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Moment'}
                </Button>
            </div>
        </form>
    );
};

const ProfilePage: React.FC = () => {
    const { profile, user } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();
    const [activeTab, setActiveTab] = useState<'Details' | 'Moments'>('Details');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMomentModalOpen, setIsMomentModalOpen] = useState(false);
    
    const [trips, setTrips] = useState<Spot[]>([]);
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [momentToDelete, setMomentToDelete] = useState<Moment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [spotsData, momentsData] = await Promise.all([
                mockApi.getUserSpots(user.id),
                mockApi.getMoments(user.id),
            ]);
            setTrips(spotsData || []);
            setMoments(momentsData || []);
        } catch (error: any) {
            console.error('Error fetching profile data:', error.message);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteMoment = async () => {
        if (!momentToDelete) return;
    
        setIsDeleting(true);
        try {
            await mockApi.deleteMoment(momentToDelete.id);
            setMoments(prev => prev.filter(m => m.id !== momentToDelete.id));
            setMomentToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete moment:", error.message);
            alert("Failed to delete moment: " + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMomentSave = () => {
        setIsMomentModalOpen(false);
        fetchData();
    };

    if (!profile) {
        return <div className="text-center p-8 text-white">Loading profile...</div>;
    }
    
    const age = profile.date_of_birth ? differenceInYears(new Date(), new Date(profile.date_of_birth)) : null;
    
    const mockPlaces = [
        { name: 'Legal', image: getPlaceholderImage('Legal') },
        { name: 'GAS', image: getPlaceholderImage('GAS') },
        { name: 'Rooftop', image: getPlaceholderImage('Rooftop') },
    ];
    
    const TabButton: React.FC<{ name: 'Details' | 'Moments' }> = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`w-full py-3 text-sm font-semibold rounded-lg transition-colors duration-300 focus:outline-none ${
                activeTab === name
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
            }`}
        >
            {name}
        </button>
    );

    return (
        <div className="bg-black text-white min-h-full font-sans p-4 pb-20 md:pb-4">
            <header className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </header>

            <section className="flex flex-col items-center text-center mb-6">
                <img
                    src={profile.profile_pic_url}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800 mb-4"
                />
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-zinc-400">{profile.name}</p>
            </section>

            <nav className="flex items-center bg-zinc-800/50 p-1 rounded-xl mb-8">
                <TabButton name="Details" />
                <TabButton name="Moments" />
            </nav>

            <main>
                {activeTab === 'Details' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <section>
                            <h2 className="text-lg font-bold mb-3">About</h2>
                            <div className="bg-zinc-900 p-4 rounded-xl flex items-center">
                                <div className="bg-red-500/20 p-2 rounded-lg mr-4">
                                    <Gift size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-300">Born on {profile.date_of_birth ? format(new Date(profile.date_of_birth), 'MMMM dd, yyyy') : 'N/A'}{age && ` (${age})`}</p>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h2 className="text-lg font-bold mb-3">Trips</h2>
                            {loading ? <p className="text-zinc-400">Loading trips...</p> : trips.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {trips.map(trip => (
                                        <div key={trip.id} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                                            <img src={getPlaceholderImage(trip.location)} alt={trip.location} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                            <div className="absolute bottom-0 left-0 p-3 text-white">
                                                <h3 className="font-bold">{trip.location}</h3>
                                                <p className="text-xs uppercase font-medium tracking-wider">{trip.day}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-zinc-400">No trips recorded yet.</p>}
                        </section>
                         <section>
                            <h2 className="text-lg font-bold mb-3">Places</h2>
                             <div className="grid grid-cols-3 gap-3">
                                {mockPlaces.map(place => (
                                    <div key={place.name} className="relative aspect-square rounded-xl overflow-hidden group">
                                        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <p className="font-bold text-sm text-white">{place.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}
                 {activeTab === 'Moments' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {loading ? <p className="text-zinc-400">Loading moments...</p> : (
                            <div className="grid grid-cols-3 gap-1">
                                <button onClick={() => setIsMomentModalOpen(true)} className="aspect-square bg-zinc-900 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-800 transition-colors">
                                    <Plus size={24}/>
                                    <span className="text-xs mt-1">Add Moment</span>
                                </button>
                                {moments.map(moment => (
                                    <div key={moment.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={moment.image_url} alt={moment.caption || 'Moment'} className="w-full h-full object-cover" />
                                        {moment.caption && (
                                            <div className="absolute inset-0 bg-black/50 p-2 flex items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs text-white line-clamp-2">{moment.caption}</p>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setMomentToDelete(moment)}
                                            className="absolute top-1.5 right-1.5 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                            aria-label="Delete moment"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                         {(!loading && moments.length === 0) && (
                            <div className="text-center py-10 text-zinc-500">
                                <p>No moments yet.</p>
                                <p>Share your first memory!</p>
                            </div>
                         )}
                    </motion.div>
                )}
            </main>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Profile">
                <ProfileForm onSave={() => setIsEditModalOpen(false)} />
            </Modal>
            <Modal isOpen={isMomentModalOpen} onClose={() => setIsMomentModalOpen(false)} title="Create a New Moment">
                <MomentForm onSave={handleMomentSave} />
            </Modal>
            <Modal isOpen={!!momentToDelete} onClose={() => setMomentToDelete(null)} title="Confirm Deletion">
                <div className="text-white">
                    <p className="mb-6">Are you sure you want to permanently delete this moment?</p>
                    <div className="flex justify-end space-x-4">
                        <Button variant="secondary" onClick={() => setMomentToDelete(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <GlowButton variant="danger" onClick={handleDeleteMoment} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </GlowButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;
