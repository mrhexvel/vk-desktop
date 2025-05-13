import { VKConversationItem } from "@/types/vk.type";

export const mockVkApiData = {
  response: {
    count: 10,
    items: [
      {
        conversation: {
          peer: {
            id: 1,
            type: "chat",
            local_id: 1,
          },
          chat_settings: {
            title: "Дизайнеы",
            owner_id: 123456,
            members_count: 14,
            state: "in",
            photo: {
              photo_50: "/group-designers.png",
              photo_100: "/group-designers.png",
              photo_200: "/group-designers.png",
            },
            active_ids: [123456, 234567, 345678, 456789, 567890],
          },
          last_message_id: 1,
          in_read: 1,
          out_read: 1,
          unread_count: 0,
          is_marked_unread: false,
          pinned_message: {
            id: 123,
            text: "сап",
            from_id: 123456,
          },
        },
        last_message: {
          id: 1,
          date: 1629456789,
          from_id: 123456,
          text: "гыгы гага",
          attachments: [],
          conversation_message_id: 1,
          peer_id: 1,
        },
      },
    ] as VKConversationItem[],
    profiles: [
      {
        id: 123456,
        first_name: "Лоа",
        last_name: "Лоа",
        photo_50: "/mike-brown.png",
        photo_100: "/mike-brown.png",
        online: 1,
        screen_name: "mike",
        sex: 2,
        online_info: {
          visible: true,
          last_seen: 1629456789,
          is_online: true,
          app_id: 0,
        },
      },
    ],
    groups: [
      {
        id: 1,
        name: "Дизайнеы",
        screen_name: "designers",
        photo_50: "/group-designers.png",
        photo_100: "/group-designers.png",
        photo_200: "/group-designers.png",
      },
    ],
  },
};
