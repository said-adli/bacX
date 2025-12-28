import { useState } from 'react';

// Mock hook - No external dependencies
export const useAgora = (client: unknown) => {
    const [active, setActive] = useState(false);

    const joinChannel = async (channelName: string, uid: string | number) => {
        // Mock Implementation
        setActive(true);
    };

    const leaveChannel = async () => {
        // Mock Implementation
        setActive(false);
    };

    return {
        localAudioTrack: null,
        localVideoTrack: null,
        joinState: active,
        leaveChannel,
        joinChannel,
        remoteUsers: [],
    };
};
