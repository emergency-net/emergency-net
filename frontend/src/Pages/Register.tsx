import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { useMutation, useQueryClient } from "react-query";
import { register } from "@/Services/register";
import useKeys from "@/Hooks/useKeys";
import { useState } from "react";
import { setCookie } from "typescript-cookie";
import useErrorToast from "@/Hooks/useErrorToast";
import { importPublicKeyPem } from "@/Library/crypt";
import { APResponseVerifier } from "@/Library/interceptors";

function Register() {
  const { MTpublic, setAdminKey } = useKeys();
  const [username, setUsername] = useState<string>("");
  const handleError = useErrorToast();
  const queryClient = useQueryClient();
  const { mutate: sendRegister } = useMutation(
    () => {
      if (username.length < 3) {
        throw new Error("Kullanıcı ismi geçersiz.");
      }
      return register({ key: MTpublic!, username: username });
    },
    {
      async onSuccess(data) {
        const content = await APResponseVerifier(data);
        const adminKey = await importPublicKeyPem(content.adminPubKey);

        setAdminKey(adminKey);
        queryClient.invalidateQueries(["adminKey"]);

        setCookie("token", content.token, { sameSite: "Strict", secure: true });

        window.location.reload();
      },
      onError: handleError,
    }
  );
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <Card className="w-[90%]">
        <CardHeader>
          <CardTitle>Kayıt Ol</CardTitle>
          <CardDescription>Bir isim seç</CardDescription>
        </CardHeader>

        <CardContent className="flex-col flex">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı İsmi..."
          />
          <Button className="self-end mt-8" onClick={() => sendRegister()}>
            Gönder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
