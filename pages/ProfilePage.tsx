import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Spot, Moment } from '../types';
import { ArrowLeft, MoreHorizontal, Gift, Plus, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInYears, format } from 'date-fns';
import { motion } from 'framer-motion';
import GlowButton from '../components/common/GlowButton';
import { mockApi, getPlaceholderImage } from '../services/mockApi';

// --- Re-usable ProfileForm for editing profile ---
const ProfileForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { profile, updateProfile } = useAuth();
    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [location, setLocation] = useState(profile?.location || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setPhone(profile.phone);
            setLocation(profile.location);
        }
    }, [profile]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile({ name, phone, location });
            setSuccess('Profile updated successfully!');
            setTimeout(() => onSave(), 1000);
        } catch (err: any) {
             setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input id="phone" label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
            <Input id="location" label="Location" value={location} onChange={e => setLocation(e.target.value)} required />

            {error && <p className="text-sm text-red-500">{error}</p>}
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
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imagePreview || !user) {
            setError('Please select an image to upload.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await mockApi.createMoment({
                user_id: user.id,
                image_url: imagePreview,
                caption,
            });
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to create moment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label htmlFor="moment-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-zinc-800/50 hover:bg-zinc-800">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                            </div>
                            <input id="moment-image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div> 
                )}
            </div>

            <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-300">Caption</label>
                <textarea id="caption" rows={3} value={caption} onChange={e => setCaption(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 sm:text-sm"
                    placeholder="Add a caption..."
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

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
    const navigate = useNavigate();
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