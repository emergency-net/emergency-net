import useKeys from "./Hooks/useKeys";
import { useMutation } from "react-query";
import axios from "axios";
import { decrypt, encrypt, exportKey, sign } from "./Library/crypt";

function App() {
  const { encryptKeys, signKeys, keysLoading } = useKeys();

  const { mutate: submitEncrypt } = useMutation(async ({ msg }: any) => {
    //const exportedKey = await exportKey(privateKey!);
    const exportedKey = await exportKey(encryptKeys!.public);

    const response = await axios.post("http://localhost:3000/mtEncryptTest", {
      key: exportedKey,
      msg,
    });

    window.alert(decrypt(encryptKeys?.private!, response.data));
  });

  const { mutate: submitSign } = useMutation(async ({ msg }: any) => {
    //const exportedKey = await exportKey(privateKey!);
    const signature = await sign(signKeys!.private!, msg);
    const exportedKey = await exportKey(encryptKeys!.public);

    axios.post("http://localhost:3000/mtSignTest", {
      key: exportedKey,
      msg,
      signature,
    });
  });

  return (
    <div>
      <h2>Encrypt</h2>
      <form
        onSubmit={(e: any) => {
          e.preventDefault();

          submitEncrypt({ msg: e.target.children[0]!.value });
        }}
      >
        <input name="msg" defaultValue={"Test"} />
        <button>Submit</button>
      </form>
      <h2>Sign</h2>
      <form
        onSubmit={(e: any) => {
          e.preventDefault();

          submitSign({ msg: e.target.children[0]!.value });
        }}
      >
        <input name="msg" defaultValue={"Test"} />
        <button>Submit</button>
      </form>
    </div>
  );
}

export default App;
