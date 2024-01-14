import { useToast } from "@/Components/ui/use-toast";
import { AxiosResponse } from "axios";

function useErrorToast() {
  const { toast } = useToast();

  function getMsg(err: any): string {
    if (typeof err === "string") {
      return err;
    } else if (err?.response?.data?.content?.error) {
      return err?.response?.data?.content?.error;
    } else if (err?.message) {
      return err?.message;
    } else {
      return "Unknown Error";
    }
  }

  function handleError(err: Error | AxiosResponse | string) {
    console.error("HANDLE_ERROR: ", err);
    toast({
      variant: "destructive",
      description: getMsg(err),
    });
  }
  return handleError;
}

export default useErrorToast;
