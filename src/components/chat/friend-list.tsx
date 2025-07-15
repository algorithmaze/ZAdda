
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { User, FriendRequest } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Plus, UserCheck, UserX, Clock, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc, onSnapshot, updateDoc, writeBatch } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { httpsCallable } from 'firebase/functions';

interface FriendListProps {
    allUsers: User[];
    currentUser: User;
}

export function FriendList({ allUsers, currentUser }: FriendListProps) {
    const { user: loggedInUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [friends, setFriends] = useState<User[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!loggedInUser) return;
        
        // Listen for friends
        const friendsQuery = query(collection(db, `users/${loggedInUser.uid}/friends`));
        const unsubscribeFriends = onSnapshot(friendsQuery, async (snapshot) => {
            const friendIds = snapshot.docs.map(doc => doc.id);
            if (friendIds.length > 0) {
                const friendsData = allUsers.filter(u => friendIds.includes(u.id));
                setFriends(friendsData);
            } else {
                setFriends([]);
            }
        });

        // Listen for incoming friend requests
        const requestsQuery = query(collection(db, "friendRequests"), where("toUserId", "==", loggedInUser.uid), where("status", "==", "pending"));
        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
            setFriendRequests(requests);
        });

        // Listen for sent friend requests
        const sentRequestsQuery = query(collection(db, "friendRequests"), where("fromUserId", "==", loggedInUser.uid), where("status", "==", "pending"));
        const unsubscribeSent = onSnapshot(sentRequestsQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
            setSentRequests(requests);
        });

        return () => {
            unsubscribeFriends();
            unsubscribeRequests();
            unsubscribeSent();
        };

    }, [loggedInUser, allUsers]);

    const handleSendRequest = async (toUser: User) => {
        if (!loggedInUser) return;
        try {
            await addDoc(collection(db, "friendRequests"), {
                fromUserId: loggedInUser.uid,
                toUserId: toUser.id,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            toast({
                title: "Success",
                description: `Friend request sent to ${toUser.name}.`
            });
        } catch (error) {
            console.error("Error sending friend request:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send friend request. Please try again."
            });
        }
    };

    const handleRequest = async (request: FriendRequest, newStatus: 'accepted' | 'declined') => {
        try {
            if (newStatus === 'accepted') {
                const acceptFriendRequest = httpsCallable(functions, 'acceptFriendRequest');
                const result = await acceptFriendRequest({ requestId: request.id });

                // This is the console comment you requested
                console.log('Cloud function `acceptFriendRequest` executed successfully:', result.data);
                
                toast({
                    title: "Friend Added",
                    description: "You are now friends."
                });
            } else {
                // For declining, we just update the status client-side
                const requestRef = doc(db, "friendRequests", request.id);
                await updateDoc(requestRef, { status: newStatus });
                toast({
                    title: "Request Declined",
                    description: "You have declined the friend request."
                });
            }
        } catch (error: any) {
            console.error("Error handling request:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not process the request. Please try again."
            });
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!loggedInUser) return;
        try {
            const batch = writeBatch(db);
            // Remove friend from both users' friends list
            batch.delete(doc(db, `users/${loggedInUser.uid}/friends/${friendId}`));
            batch.delete(doc(db, `users/${friendId}/friends/${loggedInUser.uid}`));

            // Optional: Find and delete the original friend request
            const q = query(
                collection(db, 'friendRequests'),
                where('fromUserId', 'in', [loggedInUser.uid, friendId]),
                where('toUserId', 'in', [loggedInUser.uid, friendId]),
                where('status', '==', 'accepted')
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => batch.delete(doc.ref));

            await batch.commit();
            toast({
                title: "Friend Removed",
                description: "The user has been removed from your friends list."
            });
        } catch (error) {
            console.error("Error removing friend:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not remove friend. Please try again."
            });
        }
    };

    const startChat = async (friend: User) => {
        if (!loggedInUser) return;
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("userIds", "in", [[loggedInUser.uid, friend.id], [friend.id, loggedInUser.uid]]));
    
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const existingChat = querySnapshot.docs[0];
            router.push(`/chat/${existingChat.id}`);
        } else {
            try {
                const newChatRef = doc(collection(db, "chats"));
                await setDoc(newChatRef, {
                    id: newChatRef.id,
                    userIds: [loggedInUser.uid, friend.id],
                    messages: [],
                    unreadCount: 0,
                    createdAt: serverTimestamp(),
                });
                router.push(`/chat/${newChatRef.id}`);
            } catch(error) {
                console.error("Error starting new chat: ", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not start a new chat. Please try again."
                });
            }
        }
    };
    
    const potentialFriends = useMemo(() => {
        const friendIds = friends.map(f => f.id);
        const sentRequestIds = sentRequests.map(r => r.toUserId);
        const receivedRequestIds = friendRequests.map(r => r.fromUserId);
        const excludedIds = new Set([...friendIds, ...sentRequestIds, ...receivedRequestIds, loggedInUser?.uid]);
        
        return allUsers.filter(user => 
            !excludedIds.has(user.id) && 
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [allUsers, friends, sentRequests, friendRequests, loggedInUser, searchTerm]);

    const renderUserItem = (user: User, context: 'friend' | 'request' | 'add', request?: FriendRequest) => (
        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-primary/5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => context === 'friend' && startChat(user)}>
                <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold truncate">{user.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>
            {context === 'add' && <Button size="sm" onClick={() => handleSendRequest(user)}><Plus className="mr-2 h-4 w-4" /> Add</Button>}
            {context === 'friend' && <Button size="sm" variant="outline" onClick={() => handleRemoveFriend(user.id)}><UserX className="mr-2 h-4 w-4" /> Remove</Button>}
            {context === 'request' && request && (
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="bg-green-100 hover:bg-green-200" onClick={() => handleRequest(request, 'accepted')}><UserCheck className="w-5 h-5 text-green-600" /></Button>
                    <Button size="icon" variant="ghost" className="bg-red-100 hover:bg-red-200" onClick={() => handleRequest(request, 'declined')}><UserX className="w-5 h-5 text-red-600" /></Button>
                </div>
            )}
        </div>
    );

    return (
        <Tabs defaultValue="friends" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm">
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="requests">
                    Requests
                    {friendRequests.length > 0 && <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{friendRequests.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="add">Add</TabsTrigger>
            </TabsList>
            <TabsContent value="friends" className="flex-1 overflow-y-auto">
                {friends.length > 0 ? (
                    <div className="p-2 space-y-1">
                        {friends.map(user => renderUserItem(user, 'friend'))}
                    </div>
                ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">You have no friends yet. Add some!</p>
                )}
            </TabsContent>
            <TabsContent value="requests" className="flex-1 overflow-y-auto">
                {friendRequests.length > 0 ? (
                     <div className="p-2 space-y-1">
                        {friendRequests.map(req => {
                            const user = allUsers.find(u => u.id === req.fromUserId);
                            return user ? renderUserItem(user, 'request', req) : null;
                        })}
                    </div>
                ) : (
                     <p className="p-4 text-center text-sm text-muted-foreground">No pending friend requests.</p>
                )}
            </TabsContent>
            <TabsContent value="add" className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-2 sticky top-0 bg-background/80 backdrop-blur-sm">
                   <div className="relative">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input 
                        placeholder="Search by name or email" 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                   </div>
                </div>
                {potentialFriends.length > 0 ? (
                    <div className="p-2 space-y-1">
                         {potentialFriends.map(user => renderUserItem(user, 'add'))}
                    </div>
                ) : (
                     <p className="p-4 text-center text-sm text-muted-foreground">No users found.</p>
                )}
            </TabsContent>
        </Tabs>
    );
}
