export interface Translations {
  app: {
    title: string;
    loading: string;
    error: string;
  };
  auth: {
    title: string;
    subtitle: string;
    loginButton: string;
    loginButtonLoading: string;
    description: string;
    permissions: {
      title: string;
      messages: string;
      friends: string;
      media: string;
      stories: string;
      groups: string;
      stats: string;
      offline: string;
    };
    scope: string;
  };
  sidebar: {
    title: string;
    search: string;
    noChats: string;
    logout: string;
  };
  chat: {
    selectPlaceholder: string;
    selectSubtitle: string;
    noMessages: string;
    inputPlaceholder: string;
    online: string;
    offline: string;
    members: string;
    typing: string;
    today: string;
    yesterday: string;
  };
  messages: {
    photo: string;
    video: string;
    audio: string;
    document: string;
    sticker: string;
    voice: string;
    link: string;
    attachment: string;
    forwarded: string;
    reply: string;
    user: string;
    community: string;
    wall: string;
  };
  attachments: {
    photo: string;
    video: string;
    document: string;
    audio: string;
    voice: string;
    sticker: string;
    link: string;
    file: string;
    archive: string;
    image: string;
    viewAll: string;
    download: string;
  };
  details: {
    title: string;
    description: string;
    notifications: string;
    sharedMedia: string;
    members: string;
    viewAll: string;
    chatSettings: string;
    chatActions: string;
    leaveChat: string;
    muteChat: string;
    clearHistory: string;
    deleteChat: string;
    memberActions: string;
    viewProfile: string;
    sendMessage: string;
    removeFromChat: string;
    makeAdmin: string;
    removeAdmin: string;
    memberSince: string;
    invitedBy: string;
    creator: string;
    admin: string;
    member: string;
    noDescription: string;
    editDescription: string;
    changeChatPhoto: string;
    changeChatTitle: string;
    you: string;
  };
  buttons: {
    send: string;
    attach: string;
    emoji: string;
    call: string;
    video: string;
    info: string;
    back: string;
    close: string;
    scrollToBottom: string;
    confirm: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    add: string;
    remove: string;
    invite: string;
    more: string;
  };
  status: {
    online: string;
    offline: string;
    lastSeen: string;
    typing: string;
  };
  time: {
    now: string;
    today: string;
    yesterday: string;
    minutes: string;
    hours: string;
    days: string;
  };
  modals: {
    confirmTitle: string;
    removeUserTitle: string;
    removeUserMessage: string;
    leaveGroupTitle: string;
    leaveGroupMessage: string;
    deleteHistoryTitle: string;
    deleteHistoryMessage: string;
  };
}

export type Language = "en" | "ru";
