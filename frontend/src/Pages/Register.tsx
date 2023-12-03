import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { useMutation } from "react-query";
import { register } from "@/Services/register";
import useKeys from "@/Hooks/useKeys";
import { useState } from "react";

function Register() {
  const { MTprivate } = useKeys();
  const [username, setUsername] = useState<string>("");
  const { mutate: sendRegister } = useMutation(() => {
    if (username.length < 5) {
      throw window.alert("Kullanıcı ismi geçersiz");
    }
    return register({ key: MTprivate!, username: username });
  });
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <Card className="w-[90%]">
        <CardHeader>
          <CardTitle>Kayıt Ol</CardTitle>
          <CardDescription>Bir isim seç</CardDescription>
        </CardHeader>

        <CardContent className="flex-col flex">
          <Input placeholder="Kullanıcı İsmi..." />
          <Button className="self-end mt-8">Gönder</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
