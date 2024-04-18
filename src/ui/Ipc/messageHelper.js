export const makeMessages = (messages) => {
  return messages.map((message) => ({
    ...message,
    send: message.args !== undefined ? JSON.stringify(message.args) : null,
    receive: message.result !== undefined ? JSON.stringify(message.result) : null,
  }));
};

const parseJSON = (json) => {
  try {
    let obj = JSON.parse(json);
    if (Array.isArray(obj)) {
      obj = obj.map((item) => parseJSON(item));
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        obj[key] = parseJSON(value);
      });
    }

    return obj;
  } catch (err) {
    return json;
  }
};

export const getParsedMessage = (row, sendOrReceive) => {
  if (!row) return undefined;
  if (!row[sendOrReceive]) return undefined;

  let parsed = JSON.parse(row[sendOrReceive]) || {};
  if (typeof parsed !== 'object') {
    parsed = {
      '': parseJSON(parsed),
    };
  } else if (parsed.value) {
    parsed.value = parseJSON(parsed.value);
  }
  return parsed;
};

export const getMessageTypes = (messages, rowKey) => {
  return [...new Set(messages.filter((message) => message[rowKey]).map((message) => message[rowKey]))];
};
