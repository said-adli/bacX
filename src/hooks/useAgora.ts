import { useState } from 'react';

// Hook - No external dependencies
export const useAgora = (_client: unknown) => {
    void _client;
    const [active, setActive] = useState(false);

    const joinChannel = async (_channelName: string, _uid: string | number) => {
        void _channelName;
        void _uid;
        setActive(true);
    };

    const leaveChannel = async () => {
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
