export function messagesToMap(messages: any[]) {
  const messageMap = new Map();

  messages.map((message) => messageMap.set(message.hashKey, message));
  return messageMap;
}

export function findMissingMessages(
  receivedMessages: any[],
  messageMap: Map<string, any>
) {
  const missingMessages: any[] = [];
  receivedMessages.forEach((message) => {
    if (!messageMap.has(message.hashKey)) {
      missingMessages.push(message);
    }
  });
  return missingMessages;
}
