export interface MessageSenders {
  [key: number]: { firstName?: string; groupName?: string };
}

export interface FormattedMessage {
  text: string;
  isAttachment: boolean;
  isPrivateChat: boolean;
  isAction: boolean;
}
