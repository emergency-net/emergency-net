import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCookie } from "typescript-cookie";
import axios from "axios";
import useErrorToast from "@/Hooks/useErrorToast";
import { verifyApCert } from "@/Library/cert";
import { APDataReference } from "@/Library/APData";
import { APResponseVerifier } from "@/Library/interceptors";
import { getTokenData } from "@/Library/token";
import { hello } from "@/Services/hello";
import { Button } from "./ui/button";
import { logout } from "@/Library/util";

// Create the context
const TokenDataContext = createContext<any>(null);

// Custom hook to use the context
export const useTokenData = () => useContext(TokenDataContext);

function HelloWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleError = useErrorToast();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      axios.defaults.headers.common.Authorization = token;
      const data = getTokenData(token);
      setTokenData(data);
    }

    hello()
      .then(async (res) => {
        if (res.status === 202) {
          const APData = await verifyApCert(res.data.content.cert);
          APDataReference.current = APData;
          const content = await APResponseVerifier(res.data);

          if (content.isAdmin) {
            navigate("/PUregister");
          } else {
            navigate("/register");
          }
        } else if (res.status === 200) {
          const APData = await verifyApCert(res.data.content.cert);
          APDataReference.current = APData;
          APResponseVerifier(res.data);
          if (
            location.pathname === "/" ||
            location.pathname === "" ||
            location.pathname === "/register" ||
            location.pathname === "/PUregister"
          ) {
            navigate("/home");
          }
        }
        setLoading(false);
      })
      .catch(handleError);
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col gap-4 relative items-center justify-center">
        <span>Yükleniyor...</span>
        <Button
          className="opacity-50 text-xs absolute bottom-2 right-2"
          variant={"outline"}
          size={"sm"}
          onClick={logout}
        >
          Hesabı Kapa
        </Button>
      </div>
    );
  } else {
    return (
      <TokenDataContext.Provider value={tokenData}>
        <Outlet />
      </TokenDataContext.Provider>
    );
  }
}

export default HelloWrapper;
