
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Clock, MapPin, Users, GlassWater, Plus, Ban, ThumbsUp, RadioTower } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Spot, Drink, Invitation, InvitationStatus, UserRole, UserProfile } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import GlowButton from '../components/common/GlowButton';
import { mockApi } from '../services/mockApi';
import Textarea from '../components/common/Textarea';

// FIX: Add google maps declaration to fix missing namespace errors.
declare const google: any;

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

// Type for New Spot Form Data
type NewSpotData = {
    location: string;
    date: string;
    timing: string;
    budget: string;
    description: string;
};

const initialSpotData: NewSpotData = {
    location: 'The Downtown Pub',
    date: new Date().toISOString().split('T')[0],
    timing: '21:00',
    budget: '50',
    description: '',
};

const HomePage: React.FC = () => {
    const { profile } = useAuth();
    const [spot, setSpot] = useState<Spot | null>(null);
    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isCreateSpotModalOpen, setCreateSpotModalOpen] = useState(false);
    const [isSuggestDrinkModalOpen, setSuggestDrinkModalOpen] = useState(false);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [invitableUsers, setInvitableUsers] = useState<UserProfile[]>([]);
    const [isInviting, setIsInviting] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // States for modals
    const [newDrinkSuggestion, setNewDrinkSuggestion] = useState('');
    const [drinkError, setDrinkError] = useState('');

    const [newSpotData, setNewSpotData] = useState<NewSpotData>(initialSpotData);
    const [spotErrors, setSpotErrors] = useState<Partial<Record<keyof NewSpotData, string>>>({});

    // Map state
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const [isSharingLocation, setIsSharingLocation] = useState(false);
    const locationWatchId = useRef<number | null>(null);


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
    
    const validateSpotForm = (): boolean => {
        const errors: Partial<Record<keyof NewSpotData, string>> = {};
        if (!newSpotData.location.trim()) errors.location = 'Location is required.';
        if (!newSpotData.date) errors.date = 'Date is required.';
        else if (new Date(newSpotData.date) < new Date(new Date().toDateString())) errors.date = "Date cannot be in the past.";
        if (!newSpotData.timing) errors.timing = 'Timing is required.';
        if (!newSpotData.budget) errors.budget = 'Budget is required.';
        else if (isNaN(Number(newSpotData.budget)) || Number(newSpotData.budget) <= 0) errors.budget = 'Budget must be a positive number.';

        setSpotErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateSpot = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile || !validateSpotForm()) return;

        const spotToCreate = {
            location: newSpotData.location,
            date: new Date(newSpotData.date).toISOString(),
            timing: newSpotData.timing,
            budget: Number(newSpotData.budget),
            day: new Date(newSpotData.date).toLocaleDateString('en-us', { weekday: 'long' }),
            created_by: profile.id,
            description: newSpotData.description,
        };
        
        try {
            await mockApi.createSpot(spotToCreate);
            setNewSpotData(initialSpotData); // Reset form state
            setCreateSpotModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert("Failed to create spot: " + error.message);
        }
    };

    const handleSuggestDrink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newDrinkSuggestion.trim()) {
            setDrinkError('Drink name is required.');
            return;
        }
        if (!profile || !spot) return;

        setDrinkError('');
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
        } catch (error: any)             {
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

    const handleOpenInviteModal = async () => {
        if (!spot) return;
        try {
            const allUsers = await mockApi.getAllUsers();
            const invitedUserIds = invitations.map(inv => inv.user_id);
            const usersToInvite = allUsers.filter(user => !invitedUserIds.includes(user.id));
            setInvitableUsers(usersToInvite);
            setInviteModalOpen(true);
        } catch (error) {
            console.error("Failed to get users for invitation:", error);
            alert("Failed to load user list for invitations.");
        }
    };

    const handleInviteUser = async (userId: string) => {
        if (!spot) return;
        setIsInviting(userId);
        try {
            await mockApi.inviteUserToSpot(spot.id, userId);
            await fetchData();
            setInvitableUsers(prev => prev.filter(user => user.id !== userId));
        } catch (error: any) {
            console.error("Failed to invite user:", error.message);
            alert("Failed to invite user: " + error.message);
        } finally {
            setIsInviting(null);
        }
    };
    
    const toggleLocationSharing = () => {
        if (isSharingLocation) {
            if (locationWatchId.current !== null) {
                navigator.geolocation.clearWatch(locationWatchId.current);
                locationWatchId.current = null;
            }
            setIsSharingLocation(false);
        } else {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            const successCallback = (position: GeolocationPosition) => {
                const { latitude, longitude } = position.coords;
                if (profile) {
                    mockApi.updateUserLocation(profile.id, { lat: latitude, lng: longitude });
                }
            };

            const errorCallback = (error: GeolocationPositionError) => {
                alert(`ERROR(${error.code}): ${error.message}`);
                setIsSharingLocation(false);
                if (locationWatchId.current !== null) {
                    navigator.geolocation.clearWatch(locationWatchId.current);
                }
            };
            
            locationWatchId.current = navigator.geolocation.watchPosition(successCallback, errorCallback, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            });
            setIsSharingLocation(true);
        }
    };

    useEffect(() => {
        // FIX: Add runtime check for google maps API to prevent crashes.
        if (!spot || !mapRef.current || typeof google === 'undefined' || !google.maps) return;
        if (mapInstance.current) return; // Initialize map only once
        
        const mapStyles = [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
        ];
        
        // FIX: Use global google object instead of window.google.
        mapInstance.current = new google.maps.Map(mapRef.current, {
            center: { lat: spot.latitude || 0, lng: spot.longitude || 0 },
            zoom: 14,
            disableDefaultUI: true,
            styles: mapStyles
        });
    }, [spot]);

    useEffect(() => {
        const updateMarkers = () => {
            if (!spot || !mapInstance.current) return;
            const confirmedAttendees = invitations.filter(inv => inv.status === InvitationStatus.CONFIRMED && inv.profiles.latitude && inv.profiles.longitude);

            // Clear old markers
            markersRef.current.forEach(marker => marker.map = null);
            markersRef.current = [];

            const bounds = new google.maps.LatLngBounds();

            // Spot Marker
            if (spot.latitude && spot.longitude) {
                const spotPosition = { lat: spot.latitude, lng: spot.longitude };
                const spotIcon = document.createElement('div');
                spotIcon.innerHTML = '🍻';
                spotIcon.className = 'text-3xl';
                
                const spotMarker = new google.maps.marker.AdvancedMarkerElement({
                    position: spotPosition,
                    map: mapInstance.current,
                    title: spot.location,
                    content: spotIcon
                });
                markersRef.current.push(spotMarker);
                bounds.extend(spotPosition);
            }
            
            // Attendee Markers
            confirmedAttendees.forEach(inv => {
                const user = inv.profiles;
                const position = { lat: user.latitude!, lng: user.longitude! };

                const profilePic = document.createElement('img');
                profilePic.src = user.profile_pic_url || '';
                profilePic.className = "w-10 h-10 rounded-full border-2 border-white shadow-lg";
                
                const userMarker = new google.maps.marker.AdvancedMarkerElement({
                    position,
                    map: mapInstance.current,
                    title: user.name,
                    content: profilePic
                });
                markersRef.current.push(userMarker);
                bounds.extend(position);
            });
            
            if (!bounds.isEmpty()) {
                mapInstance.current.fitBounds(bounds, 100);
            }
        }
        
        updateMarkers();

        const intervalId = setInterval(async () => {
            if (spot) {
                const updatedInvitations = await mockApi.getInvitations(spot.id);
                setInvitations(updatedInvitations);
                updateMarkers();
            }
        }, 5000);

        return () => {
            clearInterval(intervalId);
            if (locationWatchId.current !== null) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
        };
    }, [spot, invitations]);

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

            <Card className="!p-0 overflow-hidden relative">
                <div ref={mapRef} className="w-full h-96 bg-zinc-800" />
                <div className="absolute bottom-4 right-4">
                    <Button onClick={toggleLocationSharing} variant={isSharingLocation ? "danger" : "primary"}>
                        <RadioTower className="w-4 h-4 mr-2"/>
                        {isSharingLocation ? "Stop Sharing" : "Share My Location"}
                    </Button>
                </div>
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
                        {isAdmin && <Button size="sm" variant="secondary" onClick={handleOpenInviteModal}><Plus className="w-4 h-4 mr-1"/>Invite</Button>}
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
                <form onSubmit={handleCreateSpot} className="space-y-4" noValidate>
                    <Input id="location" name="location" label="Location" type="text" required list="location-suggestions" value={newSpotData.location} onChange={e => setNewSpotData({...newSpotData, location: e.target.value})} error={spotErrors.location} />
                    <datalist id="location-suggestions">
                        {locationSuggestions.map(loc => <option key={loc} value={loc} />)}
                    </datalist>

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="date" name="date" label="Date" type="date" required value={newSpotData.date} onChange={e => setNewSpotData({...newSpotData, date: e.target.value})} error={spotErrors.date} />
                        <Input id="timing" name="timing" label="Timing" type="time" required value={newSpotData.timing} onChange={e => setNewSpotData({...newSpotData, timing: e.target.value})} error={spotErrors.timing} />
                    </div>
                    <Input id="budget" name="budget" label="Budget per person" type="number" required value={newSpotData.budget} onChange={e => setNewSpotData({...newSpotData, budget: e.target.value})} error={spotErrors.budget} />
                    
                    <Textarea 
                        id="description" 
                        name="description" 
                        label="Description / Notes" 
                        rows={3} 
                        value={newSpotData.description}
                        onChange={e => setNewSpotData({...newSpotData, description: e.target.value})}
                        placeholder="e.g., Special occasion, dress code, etc."
                        error={spotErrors.description}
                    />
                    
                    <div className="flex justify-end space-x-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setCreateSpotModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Spot</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isSuggestDrinkModalOpen} onClose={() => setSuggestDrinkModalOpen(false)} title="Suggest a Drink">
                <form onSubmit={handleSuggestDrink} className="space-y-4" noValidate>
                    <Input 
                        id="drinkName" 
                        name="drinkName" 
                        label="Drink Name" 
                        type="text" 
                        required 
                        value={newDrinkSuggestion}
                        onChange={(e) => { setNewDrinkSuggestion(e.target.value); setDrinkError(''); }}
                        placeholder="e.g., Tequila Sunrise"
                        error={drinkError}
                    />
                    <div className="flex justify-end space-x-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setSuggestDrinkModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Suggest</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Users to Spot">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {invitableUsers.length > 0 ? (
                        invitableUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                <div className="flex items-center space-x-4">
                                    <img src={user.profile_pic_url} alt={user.name} className="w-10 h-10 rounded-full"/>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleInviteUser(user.id)}
                                    disabled={isInviting === user.id}
                                >
                                    {isInviting === user.id ? 'Inviting...' : 'Invite'}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">All users have been invited.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default HomePage;
