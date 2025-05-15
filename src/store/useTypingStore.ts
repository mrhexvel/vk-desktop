import { create } from "zustand";

interface TypingState {
  typing: Map<number, Map<number, number>>;
  isTyping: (peerId: number) => boolean;
  getTypingUsers: (peerId: number) => number[];
  setTyping: (peerId: number, userId: number) => void;
  clearTyping: (peerId: number, userId: number) => void;
  clearAllTyping: (peerId: number) => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  typing: new Map(),

  isTyping: (peerId: number) => {
    const typingUsers = get().typing.get(peerId);
    if (!typingUsers) return false;

    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, timestamp] of typingUsers.entries()) {
      if (now - timestamp < 6000) {
        return true;
      }
    }

    return false;
  },

  getTypingUsers: (peerId: number) => {
    const typingUsers = get().typing.get(peerId);
    if (!typingUsers) return [];

    const now = Date.now();
    const activeUsers: number[] = [];
    let hasExpired = false;

    typingUsers.forEach((timestamp, userId) => {
      if (now - timestamp < 6000) {
        activeUsers.push(userId);
      } else {
        hasExpired = true;
      }
    });

    if (hasExpired) {
      setTimeout(() => {
        const newTyping = new Map(get().typing);
        if (newTyping.has(peerId)) {
          const peerTyping = new Map(newTyping.get(peerId));
          let changed = false;

          peerTyping.forEach((timestamp, userId) => {
            if (now - timestamp >= 6000) {
              peerTyping.delete(userId);
              changed = true;
            }
          });

          if (changed) {
            if (peerTyping.size === 0) {
              newTyping.delete(peerId);
            } else {
              newTyping.set(peerId, peerTyping);
            }

            set({ typing: newTyping });
          }
        }
      }, 0);
    }

    return activeUsers;
  },

  setTyping: (peerId: number, userId: number) => {
    set((state) => {
      const newTyping = new Map(state.typing);

      if (!newTyping.has(peerId)) {
        newTyping.set(peerId, new Map());
      }

      const peerTyping = new Map(newTyping.get(peerId));
      peerTyping.set(userId, Date.now());
      newTyping.set(peerId, peerTyping);

      return { typing: newTyping };
    });
  },

  clearTyping: (peerId: number, userId: number) => {
    set((state) => {
      if (!state.typing.has(peerId)) return state;

      const newTyping = new Map(state.typing);
      const peerTyping = new Map(newTyping.get(peerId));

      peerTyping.delete(userId);

      if (peerTyping.size === 0) {
        newTyping.delete(peerId);
      } else {
        newTyping.set(peerId, peerTyping);
      }

      return { typing: newTyping };
    });
  },

  clearAllTyping: (peerId: number) => {
    set((state) => {
      if (!state.typing.has(peerId)) return state;

      const newTyping = new Map(state.typing);
      newTyping.delete(peerId);

      return { typing: newTyping };
    });
  },
}));
