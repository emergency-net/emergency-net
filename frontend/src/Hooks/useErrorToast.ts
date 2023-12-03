import { useToast } from "@/Components/ui/use-toast";
import { AxiosResponse } from "axios";

function useErrorToast() {
  const toast = useToast();

  function getMsg(err: any): string {
    if (typeof err === "string") {
      return err;
    } else if (err?.response?.data?.message) {
      return err?.response?.data?.message;
    } else if (err?.message) {
      return err?.message;
    } else {
      return "Unknown Error";
    }
  }

  function error(err: Error | AxiosResponse | string) {
    toast.toast({
      variant: "destructive",
      description: getMsg(err),
    });
  }
  return error;
}

export default useErrorToast;
