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
import { useNavigate } from "react-router-dom";
import { importPublicKeyPem } from "@/Library/crypt";
import axios from "axios";

function Register() {
  const { MTpublic, setAdminKey } = useKeys();
  const [username, setUsername] = useState<string>("");
  const handleError = useErrorToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: sendRegister } = useMutation(
    () => {
      if (username.length < 5) {
        throw new Error("Kullanıcı ismi geçersiz.");
      }
      return register({ key: MTpublic!, username: username });
    },
    {
      onSuccess(data) {
        importPublicKeyPem(data.content.adminPubKey).then((res) => {
          setAdminKey(res);
          queryClient.invalidateQueries(["adminKey"]);
        });
        setCookie("token", data.content.token);
        if (data.content.token) {
          axios.defaults.headers.common.Authorization = data.content.token;
        }
        navigate("/home");
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
