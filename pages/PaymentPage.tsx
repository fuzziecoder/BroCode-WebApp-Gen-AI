import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Payment, PaymentStatus, UserRole, Spot } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { mockApi } from '../services/mockApi';

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
    const isPaid = status === PaymentStatus.PAID;
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${isPaid ? 'bg-green-500/20 text-green-300 border-green-500' : 'bg-red-500/20 text-red-300 border-red-500'}`}>
            {isPaid ? 'Paid' : 'Not Paid'}
        </span>
    );
}

const PaymentPage: React.FC = () => {
    const { profile } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [spot, setSpot] = useState<Spot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const spotData = await mockApi.getUpcomingSpot();
            setSpot(spotData);

            if (spotData) {
                const paymentsData = await mockApi.getPayments(spotData.id);
                setPayments(paymentsData || []);
            } else {
                setPayments([]);
            }
        } catch (err: any) {
            setError("Failed to fetch payment data: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isAdmin = profile?.role === UserRole.ADMIN;

    const handlePaymentStatusChange = async (paymentId: string, newStatus: PaymentStatus) => {
        try {
            await mockApi.updatePaymentStatus(paymentId, newStatus);
            setPayments(prevPayments => prevPayments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
        } catch (error: any) {
            alert("Failed to update status: " + error.message);
        }
    };
    
    if (loading) return <div className="text-center p-8">Loading payments...</div>;
    if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            <h1 className="text-3xl font-bold">Payment</h1>

            {!spot ? (
                <Card><p className="text-center text-gray-400">No upcoming spot to make payments for.</p></Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="flex flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-semibold mb-4">Scan to Pay</h2>
                        <img 
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAfQCAYAAAD1xbdLAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAACxLAAAsSwGlPZapAAAAGHRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4zLjEyTDTsSAAAABl0RVh0Q3JlYXRpb24gVGltZQA0LzE0LzI0P5b+AgAAIABJREFUeJzs3QmQJMd17v2P+WbXVWRXQkJCISFEGghBhQKgAoIKih/goCCoKHgUFEUBP/A8FBQcRQSFoICi4kFARBAhIYSQEFJFdpXV3bxf8/P9M5NZdldXV3dXV2dnZ/v5q+n55Z3ZndmZndmZndmbzTdV6R9e+iIiIiIiIiIiIiIgI/5J6R0dERERERERERERERPjFpAIiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6RKSAiIiIiIiIiIiIiIjyTUkBERERERERERERERJ6-                    "
                            alt="QR Code for Payment"
                            className="w-48 h-48 rounded-lg mb-4 bg-white p-2"
                        />
                        <p className="text-gray-400 text-sm">Amount due: ${spot.budget}.00</p>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Payment Breakdown</h2>
                        <div className="space-y-3">
                            {payments.map(payment => (
                                <div key={payment.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <div className="flex items-center space-x-4">
                                        <img src={payment.profiles.profile_pic_url} alt={payment.profiles.name} className="w-10 h-10 rounded-full"/>
                                        <p className="font-medium">{payment.profiles.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <PaymentStatusBadge status={payment.status}/>
                                        {isAdmin && payment.status === PaymentStatus.NOT_PAID && (
                                            <Button size="sm" onClick={() => handlePaymentStatusChange(payment.id, PaymentStatus.PAID)}>
                                                Mark as Paid
                                            </Button>
                                        )}
                                        {isAdmin && payment.status === PaymentStatus.PAID && (
                                             <Button size="sm" variant="secondary" onClick={() => handlePaymentStatusChange(payment.id, PaymentStatus.NOT_PAID)}>
                                                Undo
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
