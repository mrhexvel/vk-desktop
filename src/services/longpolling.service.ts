import { useConversationsStore } from "@/store/useConversationsStore";
import { useMessageHistory } from "@/store/useMessageHistory";
import { useTypingStore } from "@/store/useTypingStore";
import { vkService } from "./vk.service";

class LongPollingService {
  private isRunning = false;
  private unsubscribers: Array<() => void> = [];
  private updateTimeouts: Record<string, NodeJS.Timeout> = {};
  private activeConversationId: number | null = null;

  constructor() {
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.handleUpdateConversations = this.handleUpdateConversations.bind(this);
    this.handleUpdateMessageHistory =
      this.handleUpdateMessageHistory.bind(this);
    this.handleTyping = this.handleTyping.bind(this);
  }

  setActiveConversation(conversationId: number | null) {
    this.activeConversationId = conversationId;
    window.vkApi.setActiveConversation(conversationId);
  }

  async start() {
    if (this.isRunning) return;

    try {
      await window.vkApi.startLongPolling(vkService.getAccessToken());
      this.isRunning = true;

      this.subscribeToEvents();
    } catch (error) {
      console.error("Failed to start Long Polling:", error);
    }
  }

  async stop() {
    if (!this.isRunning) return;

    try {
      const success = await window.vkApi.stopLongPolling();
      console.log("Long Polling service stopped:", success);

      this.isRunning = false;
      this.unsubscribeFromEvents();

      Object.values(this.updateTimeouts).forEach(clearTimeout);
      this.updateTimeouts = {};
    } catch (error) {
      console.error("Failed to stop Long Polling:", error);
    }
  }

  private subscribeToEvents() {
    this.unsubscribeFromEvents();
    this.unsubscribers = [
      window.vkApi.onNewMessage(this.handleNewMessage),
      window.vkApi.onUpdateConversations(this.handleUpdateConversations),
      window.vkApi.onUpdateMessageHistory(this.handleUpdateMessageHistory),
      window.vkApi.onTyping(this.handleTyping),
    ];
  }

  private unsubscribeFromEvents() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private debounce<T extends (...args: any[]) => void>(
    key: string,
    fn: T,
    delay = 100
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.updateTimeouts[key]) {
        clearTimeout(this.updateTimeouts[key]);
      }

      this.updateTimeouts[key] = setTimeout(() => {
        fn(...args);
        delete this.updateTimeouts[key];
      }, delay);
    };
  }

  private handleNewMessage(data: {
    peerId: number;
    messageId: number;
    isOutgoing: boolean;
  }) {
    useConversationsStore.getState().updateConversationsBackground();
    if (this.activeConversationId === data.peerId) {
      useMessageHistory.getState().updateHistoryBackground(data.peerId);
    }
  }

  private handleUpdateConversations() {
    this.debounce(
      "updateConversations",
      () => {
        useConversationsStore.getState().updateConversationsBackground();
      },
      100
    )();
  }

  private handleUpdateMessageHistory(peerId: number) {
    if (this.activeConversationId === peerId) {
      useMessageHistory.getState().updateHistoryBackground(peerId);
      return;
    }

    this.debounce(
      `updateHistory_${peerId}`,
      () => {
        console.log("Updating message history for peer:", peerId);
        useMessageHistory.getState().updateHistoryBackground(peerId);
      },
      100
    )();
  }

  private handleTyping(data: { userId: number; peerId: number }) {
    useTypingStore.getState().setTyping(data.peerId, data.userId);
  }
}

export const longPollingService = new LongPollingService();
