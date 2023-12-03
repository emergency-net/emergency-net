import { hello } from "@/Services/hello";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

function HelloWrapper() {
  const navigate = useNavigate();
  const toast = useToast();
  useEffect(() => {
    hello()
      .then((res) => {
        if (res.status === 202) {
          navigate("/register");
        } else if (res.status === 200) {
        }
      })
      .catch((err) => {
        toast.toast({
          variant: "destructive",
          description: "Somethnig went wrong during hello exchange.",
        });
      });
  }, []);
  return <Outlet />;
}

export default HelloWrapper;
