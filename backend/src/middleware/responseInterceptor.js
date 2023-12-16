import { sign } from "../util/CryptoUtil.js";

export const responseInterceptor = (req, res, next) => {
  const json = res.json.bind(res);
  res.json = function (body) {
    const oldBody = body;
    const newBody = {
      content: oldBody,
      signature: sign(JSON.stringify(oldBody)),
    };
    return json(newBody);
  };
  next();
};
