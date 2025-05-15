import { cn } from "@/lib/utils";
import { VKApiService } from "@/services/vk.service";
import { useConversationsStore } from "@/store/useConversationsStore";
import { useMessageHistory } from "@/store/useMessageHistory";
import { VKConversationItem } from "@/types/vk.type";
import { Mic, Paperclip, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./chat/MessageBubble";
import { ChatHeader } from "./ChatHeader";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export const ModernMessenger = () => {
  const [messageText, setMessageText] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const conversations = useConversationsStore((state) => state.conversations);
  const profiles = conversations?.profiles;
  const groups = conversations?.groups;
  const [activeConversation, setActiveConversation] =
    useState<VKConversationItem | null>(null);

  const fetchHistory = useMessageHistory((state) => state.fetchHistory);
  const messages = useMessageHistory((state) => state.history);

  const handleSendMessage = (): void => {
    if (messageText.trim()) {
      console.log("отправлено сообщение:", messageText);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();

    if (activeConversation) {
      fetchHistory(activeConversation.conversation.peer.id);
    }
  }, [activeConversation, fetchHistory, messageText]);

  console.log(messages);

  return (
    <div className="flex h-screen bg-[#121218] text-white">
      <div className="w-full flex">
        <Sidebar
          conversations={conversations?.items}
          activeId={activeConversation?.conversation.peer.id}
          onSelect={(conversation) => setActiveConversation(conversation)}
          getAvatar={(conv) =>
            VKApiService.getConversationAvatar(conv, profiles!, groups!)
          }
        />
        <div
          className={cn(
            "flex-1 flex flex-col",
            activeConversation && "gradient-bg"
          )}
        >
          {activeConversation && (
            <>
              <ChatHeader
                conversation={activeConversation}
                profiles={profiles}
                groups={groups}
                showRightSidebar={showRightSidebar}
                setShowRightSidebar={setShowRightSidebar}
                getAvatar={(conv) =>
                  VKApiService.getConversationAvatar(conv, profiles!, groups!)
                }
              />

              <ScrollArea className="flex-1 h-72 p-4">
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                  {messages?.items.map((message) => {
                    return <MessageBubble {...message} key={message.id} />;
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3">
                <div className="flex items-center gap-2 bg-[#2a2a3a] rounded-full p-1 pl-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите сообщение..."
                    className="bg-transparent border-none focus-visible:ring-0 h-9 placeholder:text-gray-500"
                  />

                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#3a3a4a]"
                    >
                      <Paperclip className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#3a3a4a]"
                    >
                      <Smile className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#3a3a4a]"
                    >
                      <Mic className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      className="rounded-full bg-[#5d3f92] hover:bg-[#4a3173] h-9 w-9"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
