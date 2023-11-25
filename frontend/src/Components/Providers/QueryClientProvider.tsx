import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

type QueryProviderProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
