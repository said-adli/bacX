
export type InteractionStatus = 'waiting' | 'live' | 'ended' | 'idle';

export interface LiveInteraction {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    status: InteractionStatus;
    peer_id: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    role: 'student' | 'teacher' | 'admin';
    is_question: boolean;
    created_at: string;
    status?: 'pending' | 'sent' | 'failed';
}

// Snapshot Interface
export interface ChatState {
    status: InteractionStatus;
    queue: LiveInteraction[];
    messages: ChatMessage[];
    currentSpeaker: LiveInteraction | null;
}

type Listener = () => void;

class ChatStore {
    private static instance: ChatStore;

    // Immutable State Snapshot
    private state: ChatState = {
        status: 'idle',
        queue: [],
        messages: [],
        currentSpeaker: null
    };

    // Internal Buffer
    private displayBuffer: ChatMessage[] = [];
    private displayedIds: Set<string> = new Set();

    private listeners: Set<Listener> = new Set();
    private rafId: number | null = null;

    private constructor() {
        this.startScheduler();
    }

    static getInstance() {
        if (!ChatStore.instance) {
            ChatStore.instance = new ChatStore();
        }
        return ChatStore.instance;
    }

    // --- Subscription ---
    subscribe = (listener: Listener) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    private notify() {
        this.listeners.forEach(l => l());
    }

    getSnapshot = () => this.state;

    // --- Scheduler (rAF Loop) ---
    private startScheduler() {
        const loop = () => {
            this.processBuffer();
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }

    private processBuffer() {
        if (this.displayBuffer.length === 0) return;

        const CHUNK_SIZE = 3;
        const toAdd: ChatMessage[] = [];
        let count = 0;

        while (count < CHUNK_SIZE && this.displayBuffer.length > 0) {
            const next = this.displayBuffer[0];
            if (!this.displayedIds.has(next.id)) {
                this.displayedIds.add(next.id);
                toAdd.push(next);
                count++;
            }
            this.displayBuffer.shift();
        }

        if (toAdd.length > 0) {
            // Update State Immutable
            this.state = {
                ...this.state,
                messages: [...this.state.messages, ...toAdd]
            };
            this.notify();
        }
    }

    // --- Actions ---

    setQueue(queue: LiveInteraction[]) {
        if (this.state.queue === queue) return; // Simple optimization
        this.state = { ...this.state, queue };
        this.notify();
    }

    setStatus(status: InteractionStatus) {
        if (this.state.status === status) return;
        this.state = { ...this.state, status };
        this.notify();
    }

    setCurrentSpeaker(speaker: LiveInteraction | null) {
        this.state = { ...this.state, currentSpeaker: speaker };
        this.notify();
    }

    ingestMessages(incoming: ChatMessage[]) {
        const totallyNew = incoming.filter(m => !this.displayedIds.has(m.id));

        if (totallyNew.length === 0) return;

        if (this.displayedIds.size === 0) {
            totallyNew.forEach(m => this.displayedIds.add(m.id));
            this.state = {
                ...this.state,
                messages: [...totallyNew]
            };
            this.notify();
        } else {
            const bufferIds = new Set(this.displayBuffer.map(b => b.id));
            const distinct = totallyNew.filter(m => !bufferIds.has(m.id));
            this.displayBuffer.push(...distinct);
        }
    }

    addOptimisticMessage(msg: ChatMessage) {
        this.displayedIds.add(msg.id);
        this.state = {
            ...this.state,
            messages: [...this.state.messages, msg]
        };
        this.notify();
    }

    updateMessageStatus(tempId: string, status: 'sent' | 'failed') {
        const newMessages = this.state.messages.map(m =>
            m.id === tempId ? { ...m, status } : m
        );
        this.state = { ...this.state, messages: newMessages };
        this.notify();
    }

    reset() {
        this.state = {
            status: 'idle',
            queue: [],
            messages: [],
            currentSpeaker: null
        };
        this.displayBuffer = [];
        this.displayedIds.clear();
        this.notify();
    }
}

export const chatStore = ChatStore.getInstance();
