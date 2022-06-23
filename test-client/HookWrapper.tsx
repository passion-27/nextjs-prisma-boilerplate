import { ReactNode } from 'react';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMockRouter } from 'test-client/Wrapper';
import SuspenseWrapper from 'lib-client/providers/SuspenseWrapper';
import ErrorBoundaryWrapper from 'lib-client/providers/ErrorBoundaryWrapper';

export type HookWrapperProps = {
  children: ReactNode;
  session: Session;
  queryClient: QueryClient;
  router?: Partial<NextRouter>;
};

/**
 * used only in tests
 */
// SuspenseWrapper for Suspense and ErrorBoundary in useQuery
// SessionProvider for useSession in useMe
// MeProvider is not used in hooks
// RouterContext for redirect onSuccess
const HookWrapper = ({ children, session, queryClient, router }: HookWrapperProps) => {
  return (
    <ErrorBoundaryWrapper errorFallbackType="test">
      <RouterContext.Provider value={{ ...createMockRouter(), ...router }}>
        <SessionProvider session={session} refetchInterval={5 * 60}>
          <QueryClientProvider client={queryClient}>
            <SuspenseWrapper loaderType="test">{children}</SuspenseWrapper>
          </QueryClientProvider>
        </SessionProvider>
      </RouterContext.Provider>
    </ErrorBoundaryWrapper>
  );
};

export default HookWrapper;
