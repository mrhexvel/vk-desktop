export const MESSAGE_ATTACHMENT_TYPES = {
  sticker: "Стикер",
  photo: "Фотография",
  wall: "Пост",
  audio_message: "Аудиозапись",
} as const;

export const MESSAGE_ACTION_TYPES = {
  chat_invite_user_by_link: "Присоединился",
  chat_invite_user: "Добавлен",
  chat_kick_user: "Исключён",
} as const;
