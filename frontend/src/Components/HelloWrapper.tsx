import { hello } from "@/Services/hello";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { getCookie } from "typescript-cookie";
import axios from "axios";
import useErrorToast from "@/Hooks/useErrorToast";

function HelloWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleError = useErrorToast();
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
          if (location.pathname == "/" || location.pathname == "") {
            navigate("/home");
          }
        }
      })
      .catch(handleError);
  }, []);
  return <Outlet />;
}

export default HelloWrapper;
