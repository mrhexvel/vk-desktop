import { VKMessage } from "@/types/vk.type";

export const mockMessages: VKMessage[] = [
  {
    id: 1,
    date: 1629456789,
    from_id: 901234,
    text: "",
    attachments: [
      {
        type: "audio_message",
        audio_message: {
          duration: 12,
          waveform: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7,
            8, 9, 8, 7, 6, 5, 4, 3, 2, 1,
          ],
          link_mp3: "https://example.com/audio.mp3",
          transcript: "",
        },
      },
    ],
    conversation_message_id: 1,
    peer_id: 1,
  },
  {
    id: 2,
    date: 1629456790,
    from_id: 234567,
    text: "guys, new version of streaming platform app design is ready, what do you think? 🤔",
    attachments: [
      {
        type: "photo",
        photo: {
          id: 1,
          album_id: 1,
          owner_id: 234567,
          sizes: [
            {
              type: "s",
              url: "/app-design.png",
              width: 75,
              height: 75,
            },
            {
              type: "m",
              url: "/app-design.png",
              width: 130,
              height: 130,
            },
            {
              type: "x",
              url: "/app-design.png",
              width: 604,
              height: 604,
            },
            {
              type: "y",
              url: "/app-design.png",
              width: 807,
              height: 807,
            },
            {
              type: "z",
              url: "/app-design.png",
              width: 1080,
              height: 1080,
            },
            {
              type: "w",
              url: "/app-design.png",
              width: 2560,
              height: 2560,
            },
          ],
          text: "",
          date: 1629456790,
          access_key: "access_key",
        },
      },
    ],
    conversation_message_id: 2,
    peer_id: 1,
  },
  {
    id: 3,
    date: 1629456791,
    from_id: 890123,
    text: "I like it, the colors look so much better in this version! 👍 👍",
    attachments: [],
    conversation_message_id: 3,
    peer_id: 1,
  },
  {
    id: 4,
    date: 1629456792,
    from_id: 123456,
    text: "10/10, it looks awesome! 😍",
    attachments: [],
    conversation_message_id: 4,
    peer_id: 1,
  },
];
