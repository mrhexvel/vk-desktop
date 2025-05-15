import type { VKMessage, VKProfile } from "@/types/vk.type";
import { MessageBubble } from "../MessageBubble";

interface ForwardedMessagesProps {
  messages: VKMessage[];
  profileMap: Record<number, VKProfile>;
}

export const ForwardedMessages = ({
  messages,
  profileMap,
}: ForwardedMessagesProps) => {
  return (
    <div className="pl-2 my-2">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          {...message}
          profile={profileMap[message.from_id]}
          profileMap={profileMap}
          isForwarded
        />
      ))}
    </div>
  );
};
