"use client";

import { useState } from "react";
import AdminLiveClient from "@/components/admin/live/AdminLiveClient";
import LiveSessionManager from "@/components/admin/live/LiveSessionManager";
import { LiveSession } from "@/actions/admin-live";


export default function AdminLivePage() {
    const [activeSession, setActiveSession] = useState<LiveSession | null>(null);

    return (
        <div className="container mx-auto max-w-7xl py-6">
            {activeSession ? (
                <AdminLiveClient
                    roomName={activeSession.id}
                    onExit={() => setActiveSession(null)}
                />
            ) : (
                <LiveSessionManager onJoinSession={setActiveSession} />
            )}
        </div>
    );
}
