import { hello } from "@/Services/hello";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCookie } from "typescript-cookie";
import axios from "axios";
import useErrorToast from "@/Hooks/useErrorToast";

function HelloWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleError = useErrorToast();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    hello()
      .then((res) => {
        setLoading(false);
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
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  } else return <Outlet />;
}

export default HelloWrapper;
