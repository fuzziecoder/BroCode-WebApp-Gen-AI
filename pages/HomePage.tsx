import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, GlassWater, Plus, Ban, ThumbsUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Spot, Drink, Invitation, InvitationStatus, UserRole } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import GlowButton from '../components/common/GlowButton';
import { mockApi } from '../services/mockApi';

const locationSuggestions = ['The Downtown Pub', 'Rooftop Bar', 'The Old Cellar', 'Clubhouse', 'The Bar', 'Lounge 3000'];

const StatusBadge: React.FC<{ status: InvitationStatus }> = ({ status }) => {
    const statusStyles = {
        [InvitationStatus.CONFIRMED]: 'bg-green-500/20 text-green-300 border-green-500/30',
        [InvitationStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        [InvitationStatus.DECLINED]: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const HomePage: React.FC = () => {
    const { profile } = useAuth();
    const [spot, setSpot] = useState<Spot | null>(null);
    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isCreateSpotModalOpen, setCreateSpotModalOpen] = useState(false);
    const [isSuggestDrinkModalOpen, setSuggestDrinkModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [newDrinkSuggestion, setNewDrinkSuggestion] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const spotData = await mockApi.getUpcomingSpot();
            setSpot(spotData);

            if (spotData) {
                const [drinksData, invitationsData] = await Promise.all([
                    mockApi.getDrinks(spotData.id),
                    mockApi.getInvitations(spotData.id)
                ]);
                setDrinks(drinksData || []);
                setInvitations(invitationsData || []);
            }
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const userInvitation = invitations.find(a => a.user_id === profile?.id);
    const isAdmin = profile?.role === UserRole.ADMIN;
    const canInteract = profile?.role === UserRole.ADMIN || profile?.role === UserRole.USER;

    const handleStatusChange = async (newStatus: InvitationStatus) => {
        if (!profile || !spot || !userInvitation) return;
        
        try {
            await mockApi.updateInvitationStatus(userInvitation.id, newStatus);
            fetchData();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status.");
        }
    };
    
    const handleCreateSpot = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile) return;

        const formData = new FormData(e.currentTarget);
        const newSpotData = {
            location: formData.get('location') as string,
            date: new Date(formData.get('date') as string).toISOString(),
            timing: formData.get('timing') as string,
            budget: Number(formData.get('budget')),
            day: new Date(formData.get('date') as string).toLocaleDateString('en-us', { weekday: 'long' }),
            created_by: profile.id,
            description: formData.get('description') as string,
        };
        
        try {
            await mockApi.createSpot(newSpotData);
            setCreateSpotModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert("Failed to create spot: " + error.message);
        }
    };

    const handleSuggestDrink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newDrinkSuggestion.trim() || !profile || !spot) return;

        const newDrink = {
            spot_id: spot.id,
            name: newDrinkSuggestion,
            image_url: `https://picsum.photos/seed/${newDrinkSuggestion.toLowerCase().replace(' ','-')}/200`,
            votes: 1,
            suggested_by: profile.id,
            voted_by: [profile.id]
        };
        
        try {
            await mockApi.suggestDrink(newDrink);
            setNewDrinkSuggestion('');
            setSuggestDrinkModalOpen(false);
            fetchData();
        } catch (error: any) {
             alert("Failed to suggest drink: " + error.message);
        }
    };

    const handleVote = async (drinkId: string) => {
        if (!profile) return;
        
        try {
            await mockApi.updateVote(drinkId, profile.id);
            fetchData();
        } catch (error) {
            console.error("Failed to vote:", error);
            alert("Failed to vote.");
        }
    };
    
    const sortedDrinks = [...drinks].sort((a, b) => b.votes - a.votes);

    if (loading) return <div className="text-center p-8">Loading spot details...</div>;
    if (error) return <div className="text-center p-8 text-red-400">Error: {error}</div>;
    if (!spot) {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4 text-zinc-400">No upcoming spots found.</h1>
                {isAdmin && <Button onClick={() => setCreateSpotModalOpen(true)}><Plus className="w-4 h-4 mr-2"/>Create Spot</Button>}
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Upcoming Spot</h1>
                {isAdmin && <Button variant="secondary" onClick={() => setCreateSpotModalOpen(true)}><Plus className="w-4 h-4 mr-2"/>Create New</Button>}
            </div>

            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-300">
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-8 h-8 text-zinc-400"/>
                        <div>
                            <p className="font-semibold text-white">{new Date(spot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-gray-400">{spot.day}</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-3">
                        <Clock className="w-8 h-8 text-zinc-400"/>
                        <div>
                            <p className="font-semibold text-white">{spot.timing}</p>
                            <p className="text-sm text-gray-400">Be there!</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-3">
                        <MapPin className="w-8 h-8 text-zinc-400"/>
                        <div>
                            <p className="font-semibold text-white">{spot.location}</p>
                            <p className="text-sm text-gray-400">Venue</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-3">
                        <Users className="w-8 h-8 text-zinc-400"/>
                        <div>
                            <p className="font-semibold text-white">${spot.budget} / person</p>
                            <p className="text-sm text-gray-400">Est. Budget</p>
                        </div>
                    </div>
                </div>
                {spot.description && (
                    <div className="mt-6 pt-4 border-t border-zinc-800">
                        <p className="text-sm text-gray-300 italic">{spot.description}</p>
                    </div>
                )}
                {!isAdmin && userInvitation && userInvitation.status === InvitationStatus.PENDING && (
                    <div className="mt-6 flex justify-center space-x-4">
                        <GlowButton onClick={() => handleStatusChange(InvitationStatus.CONFIRMED)}>
                            Confirm Attendance
                        </GlowButton>
                        <GlowButton variant="danger" onClick={() => handleStatusChange(InvitationStatus.DECLINED)}>
                            Decline
                        </GlowButton>
                    </div>
                )}
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center"><GlassWater className="w-5 h-5 mr-2"/>Drinks on Deck</h2>
                        <Button size="sm" variant="secondary" onClick={() => setSuggestDrinkModalOpen(true)} disabled={!canInteract}><Plus className="w-4 h-4 mr-1"/>Suggest</Button>
                    </div>
                    <div className="space-y-3">
                        {sortedDrinks.map(drink => {
                            const hasVoted = profile ? drink.voted_by.includes(profile.id) : false;
                            return (
                                <div key={drink.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <div className="flex items-center space-x-4">
                                        <img src={drink.image_url} alt={drink.name} className="w-12 h-12 rounded-md object-cover"/>
                                        <div>
                                            <p className="font-semibold">{drink.name}</p>
                                            <p className="text-xs text-gray-400">Suggested by {drink.profiles?.name || 'a user'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-lg">{drink.votes}</span>
                                        <button 
                                            onClick={() => handleVote(drink.id)}
                                            className={`p-2 rounded-full transition-colors ${hasVoted ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:bg-zinc-700'} disabled:cursor-not-allowed disabled:text-gray-600 disabled:hover:bg-transparent`}
                                            aria-label={`Vote for ${drink.name}`}
                                            disabled={!canInteract}
                                        >
                                            <ThumbsUp className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                         {sortedDrinks.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No drinks suggested yet. Be the first!</p>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center"><Users className="w-5 h-5 mr-2"/>Invitation List</h2>
                        {isAdmin && <Button size="sm" variant="secondary" disabled><Plus className="w-4 h-4 mr-1"/>Invite</Button>}
                    </div>
                     <div className="space-y-3">
                        {invitations.map(invitation => (
                            <div key={invitation.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                <div className="flex items-center space-x-4">
                                    <img src={invitation.profiles.profile_pic_url} alt={invitation.profiles.name} className="w-10 h-10 rounded-full"/>
                                    <p className="font-medium">{invitation.profiles.name}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <StatusBadge status={invitation.status} />
                                    {isAdmin && invitation.user_id !== profile?.id && (
                                        <button className="text-gray-400 hover:text-red-400"><Ban className="w-5 h-5"/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Modals */}
            <Modal isOpen={isCreateSpotModalOpen} onClose={() => setCreateSpotModalOpen(false)} title="Create New Spot">
                <form onSubmit={handleCreateSpot} className="space-y-4">
                    <Input id="location" name="location" label="Location" type="text" required defaultValue="New Hotspot" list="location-suggestions" />
                    <datalist id="location-suggestions">
                        {locationSuggestions.map(loc => <option key={loc} value={loc} />)}
                    </datalist>

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="date" name="date" label="Date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}/>
                        <Input id="timing" name="timing" label="Timing" type="time" required defaultValue="21:00"/>
                    </div>
                    <Input id="budget" name="budget" label="Budget per person" type="number" required defaultValue="50"/>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                            Description / Notes
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition"
                            placeholder="e.g., Special occasion, dress code, etc."
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setCreateSpotModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Spot</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isSuggestDrinkModalOpen} onClose={() => setSuggestDrinkModalOpen(false)} title="Suggest a Drink">
                <form onSubmit={handleSuggestDrink} className="space-y-4">
                    <Input 
                        id="drinkName" 
                        name="drinkName" 
                        label="Drink Name" 
                        type="text" 
                        required 
                        value={newDrinkSuggestion}
                        onChange={(e) => setNewDrinkSuggestion(e.target.value)}
                        placeholder="e.g., Tequila Sunrise"
                    />
                    <div className="flex justify-end space-x-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setSuggestDrinkModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Suggest</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HomePage;
