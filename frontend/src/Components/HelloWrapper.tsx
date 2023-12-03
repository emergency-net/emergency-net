import { hello } from "@/Services/hello";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { getCookie } from "typescript-cookie";
import axios from "axios";

function HelloWrapper() {
  const navigate = useNavigate();
  const toast = useToast();
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    hello()
      .then((res) => {
        if (res.status === 202) {
          navigate("/register");
        } else if (res.status === 200) {
          navigate("/home");
        }
      })
      .catch(() => {
        toast.toast({
          variant: "destructive",
          description: "Somethnig went wrong during hello exchange.",
        });
      });
  }, []);
  return <Outlet />;
}

export default HelloWrapper;
