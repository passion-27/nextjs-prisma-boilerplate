import { FC, ReactNode } from 'react';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { IconContext } from 'react-icons';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'next-themes';
import { themes as defaultThemes } from 'lib-client/constants';
import { MeContext } from 'lib-client/providers/Me';
import SuspenseWrapper from 'lib-client/providers/SuspenseWrapper';
import { fakeUser } from './server/fake-data';
import ErrorBoundaryWrapper from 'lib-client/providers/ErrorBoundaryWrapper';

export type WrapperProps = {
  children: ReactNode;
  session: Session;
  queryClient: QueryClient;
  dehydratedState?: unknown;
  themes?: string[];
  router?: Partial<NextRouter>;
};

/**
 * used only in tests
 */
const Wrapper: FC<WrapperProps> = ({
  children,
  session,
  queryClient,
  dehydratedState,
  themes = defaultThemes,
  router,
}) => {
  return (
    <ErrorBoundaryWrapper errorFallbackType="test">
      <RouterContext.Provider value={{ ...createMockRouter(), ...router }}>
        <SessionProvider session={session} refetchInterval={5 * 60}>
          <ThemeProvider themes={themes} attribute="class">
            <IconContext.Provider value={{ className: 'react-icons' }}>
              <QueryClientProvider client={queryClient}>
                <Hydrate state={dehydratedState}>
                  <SuspenseWrapper loaderType="test">
                    {/* pass logged in use synchronously to prevent act errors */}
                    <MeContext.Provider value={{ me: fakeUser }}>
                      {/* component, not a page */}
                      {children}
                    </MeContext.Provider>
                  </SuspenseWrapper>
                </Hydrate>
              </QueryClientProvider>
            </IconContext.Provider>
          </ThemeProvider>
        </SessionProvider>
      </RouterContext.Provider>
    </ErrorBoundaryWrapper>
  );
};

export function createMockRouter(router?: Partial<NextRouter>): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    back: jest.fn(() => Promise.resolve(true)),
    beforePopState: jest.fn(() => Promise.resolve(true)),
    push: jest.fn(() => Promise.resolve(true)),
    prefetch: jest.fn(() => Promise.resolve()),
    reload: jest.fn(() => Promise.resolve(true)),
    replace: jest.fn(() => Promise.resolve(true)),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    isPreview: false,
    ...router,
  };
}

export default Wrapper;
