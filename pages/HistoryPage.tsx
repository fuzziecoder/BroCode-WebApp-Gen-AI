import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Spot, UserRole } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { mockApi } from '../services/mockApi';


const HistoryPage: React.FC = () => {
    const { profile } = useAuth();
    const [history, setHistory] = useState<Spot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await mockApi.getPastSpots();
            setHistory(data || []);
        } catch(err: any) {
            setError('Failed to fetch spot history: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isAdmin = profile?.role === UserRole.ADMIN;

    if (loading) return <div className="text-center p-8">Loading history...</div>;
    if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            <h1 className="text-3xl font-bold">Spot History</h1>

            {history.length === 0 ? (
                <Card>
                    <p className="text-center text-gray-400">No past spots to show.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {history.map(spot => (
                        <Card key={spot.id}>
                            <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-indigo-400">{spot.location}</h2>
                                    <p className="text-gray-300">
                                        {new Date(spot.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <p className="mt-2 md:mt-0 text-lg font-semibold">${spot.budget} / person</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <h3 className="font-semibold text-gray-400 mb-2">Admin Feedback:</h3>
                                {spot.feedback ? (
                                    <p className="text-gray-300 italic">"{spot.feedback}"</p>
                                ) : (
                                    <div className="text-gray-500">
                                        <p>No feedback yet.</p>
                                        {isAdmin && (
                                            <Button variant="secondary" size="sm" className="mt-2">
                                                <MessageSquarePlus className="w-4 h-4 mr-2"/>
                                                Add Feedback
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
