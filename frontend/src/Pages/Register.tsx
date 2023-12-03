import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";

function Register() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <Card className="w-[90%]">
        <CardHeader>
          <CardTitle>Kayıt Ol</CardTitle>
          <CardDescription>Bir isim seç</CardDescription>
        </CardHeader>

        <CardContent className="flex-col flex">
          <Input placeholder="İsim..." />
          <Button className="self-end mt-8">Gönder</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
