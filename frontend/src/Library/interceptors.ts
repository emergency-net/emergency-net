import { APDataReference } from "./APData";
import { sign, verify } from "./crypt";
import { readPrivateKey } from "./keys";
const subtleCrypto = window.crypto.subtle;

export async function APResponseVerifier({
  content,
  signature,
}: {
  content: Record<string, any>;
  signature: string;
}) {
  const APData = APDataReference.current;
  if (!APData) {
    throw new Error("AP Data Unknown");
  }

  const stringContent = JSON.stringify(content);

  const verified = await verify(APData.key, signature, stringContent);

  if (verified) {
    return content;
  } else {
    throw new Error(
      `Signature invalid on content:\n${JSON.stringify(content, null, 2)}`
    );
  }
}

export async function MTResponseSigner(content: Record<string, any>) {
  const MTKey = await readPrivateKey();
  const signature = await sign(MTKey, JSON.stringify(content));

  return { content, signature };
}
