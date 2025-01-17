import React, { useState, useEffect } from "react";
import { db } from "../services/firebase"; // Assuming db is initialized in firebase.js
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
} from "firebase/firestore";

const AnnouncementPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Reference to the collection and query
                const q = query(
                    collection(db, "community-announcement"),
                    where("communityId", "==", "COMM-1736336531213"),
                    orderBy("timestamp", "desc")
                );

                // Execute the query
                const querySnapshot = await getDocs(q);

                // Map through documents and extract data
                const announcementsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setAnnouncements(announcementsData);
            } catch (error) {
                console.error("Error fetching announcements:", error);
                alert(error)
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    if (loading) {
        return <p>Loading announcements...</p>;
    }

    return (
        <div>
            <h1>Announcements</h1>
            {announcements.length > 0 ? (
                announcements.map((announcement) => (
                    <div key={announcement.id} style={{ marginBottom: "1rem" }}>
                        <h3>{announcement.communityName}</h3>
                        <p>{announcement.announcement}</p>
                        <small>
                            {new Date(
                                announcement.timestamp.toDate()
                            ).toLocaleString()}
                        </small>
                    </div>
                ))
            ) : (
                <p>No announcements available.</p>
            )}
        </div>
    );
};

export default AnnouncementPage;
