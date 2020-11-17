const listAttributes = new Map(
  Object.entries({
    "conversations.list": "channels",
    "conversations.history": "messages",
    "users.list": "members",
  })
);
export { listAttributes };
