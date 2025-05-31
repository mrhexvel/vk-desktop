import MessageBubble from "@/components/Chat/MessageBubble";
import type { VKProfile } from "@/types/vk.type";

interface ForwardedMessagesProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
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
          {...message}
          key={message.date}
          profile={profileMap[message.from_id]}
          profileMap={profileMap}
          isForwarded
        />
      ))}
    </div>
  );
};
