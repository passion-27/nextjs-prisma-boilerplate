### Setup tests in Next.js (no type checking)

- [docs](https://nextjs.org/docs/testing)
- jest setup [vercel example](https://github.com/vercel/next.js/tree/canary/examples/with-jest)

### Setup tests in Next.js (ts-jest)

- youtube [playlist](https://www.youtube.com/watch?v=7uKVFD_VMT8&list=PLYSZyzpwBEWTBdbfStjqJSGaulqcHoNkT&index=2)

#### Install ts-jest

```sh
yarn add --dev jest ts-jest @types/jest

# create jest.config.js
yarn ts-jest config:init
```

#### Install React Testing Library

```sh
yarn add --dev @testing-library/react @testing-library/user-event @testing-library/dom @testing-library/jest-dom

# package.json
"test": "jest",
```

```js
// jest.config.js
testEnvironment: 'jsdom',
globals: {
    'ts-jest': {
        tsconfig: './tsconfig.jest.json',
    },
},
setupFilesAfterEnv: ['./jest.setup.ts'],

// jest.setup.ts
import '@testing-library/jest-dom';
```

#### Setup Eslint

```sh
# test with fit()
yarn add --dev eslint eslint-plugin-jest

# test with screen.debug()
yarn add --dev eslint-plugin-testing-library
```

- rtlRender in unit tests, customRender with loggedin user and all providers in integration tests

### React Query testing

- [docs](https://react-query.tanstack.com/guides/testing)
- [tkdodo blog](https://tkdodo.eu/blog/testing-react-query)
- [tkdodo repo](https://github.com/TkDodo/testing-react-query)
- test mutation [codesandbox](https://codesandbox.io/s/friendly-brahmagupta-1dz7v?file=/src/App.test.js) - perform mutation and assert result on ui

### Forms testing

- Bruno Antunes [youtube](https://www.youtube.com/watch?v=MhFSuOjU624)
- Github [code](https://github.com/bmvantunes/youtube-react-testing-video8-forms-react-testing-library)

### React Testing Libraries queries

- bug: `TypeError: window.matchMedia is not a function`, [solution](https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function)

- Print element by class - `screen.debug()`

```ts
const postsList = document.querySelector('.home__list');
screen.debug(postsList, 20 * 1000);
```

- if it has state (async) update debug has to wait (`state wrapped with act() warning`) if not already bellow waitFor(), findby()...

```ts
await waitFor(() => {
  const postsList = document.querySelector('.home__list');
  screen.debug(postsList, 20000);
});
```

- better name element you are selecting

```ts
const title = screen.getByRole('heading', {
  name: /home/i,
});
```

- select text input

```ts
// option 1
const searchInput = screen.getByRole('textbox', {
  name: /search/i,
});
// option 2
const searchInput = screen.getByLabelText(/search/i);
```

- run only one test or describe

```
yarn jest -t "describe desc..." // single describe()
yarn jest -t "test desc..." // single test()
yarn test:client --onlyFailures // run only failed tests

test.only('...')
describe.only('...')

test.skip('...')
describe.skip('...')
```

- problem: `The above error occurred in the <Link> component, Error: Uncaught [TypeError: Cannot read properties of undefined (reading 'catch')]`, solution: `jest.fn() must return promise` (important, spent half day on it)

```ts
prefetch: jest.fn(() => Promise.resolve()),
reload: jest.fn(() => Promise.resolve(true)),
```

- variable inside a regex

```ts
const title = await screen.findByRole('heading', {
  name: RegExp(`${searchTerm}`, 'i'),
});
```

- integration tests - views folder, unit - components, hooks
- ask afterEach() clear router.push: jest.fn()?
- optimal query for spaces \s? `screen.getByLabelText(/confirm password/i);`, answer: use space

```ts
// space is space
\s matches any whitespace character (equivalent to [\r\n\t\f\v ])
```

- mock single property/fn from module import

```ts
// https://stackoverflow.com/questions/59312671/mock-only-one-function-from-module-but-leave-rest-with-original-functionality
// cast type
// https://stackoverflow.com/a/60007123/4383275
// jest.requireActual(...) - most important

// import
import { signIn, ClientSafeProvider } from 'next-auth/react';

// set
jest.mock('next-auth/react', () => ({
  ...(jest.requireActual('next-auth/react') as {}), // cast just for spread
  signIn: jest.fn().mockReturnValue({ ok: false }),
}));
const mockedSignIn = jest.mocked(signIn, true); // just for type .mockClear();

// assert
await waitFor(() => expect(mockedSignIn).toHaveBeenCalledWith(providers.facebook.id));
// cleanup mock
mockedSignIn.mockClear();
```

- alternative way - spyOn(), difference?
- views folder - integration tests

- mock image File [gist](https://gist.github.com/josephhanson/372b44f93472f9c5a2d025d40e7bb4cc)
- mock URL.createObjectURL in jest-dom [stackoverflow](https://stackoverflow.com/questions/52968969/jest-url-createobjecturl-is-not-a-function)

- how to use jest.spyOn() to mock local function [tutorial](https://www.carlrippon.com/how-to-mock-a-function-in-jest-with-typescript/)

```ts
// jest.spyOn(object, methodName);
import * as data from './data'; // local import
const mock = jest.spyOn(data, 'getCharacter').mockResolvedValue('Bob'); // za promise
mock.mockRestore(); // oslobodi fju na kraju testa
```

- image mocked as {} somewhere ??? [next docs](https://nextjs.org/docs/testing), bad way, use msw
- msw mock image binary response [docs](https://mswjs.io/docs/recipes/binary-response-type)

- load `.env.test` and `.env.test.local` in tests [stackoverflow](https://stackoverflow.com/questions/63934104/environment-variables-undefined-in-nextjs-when-running-jest)

- mock File and Blob in Node.js polyfill [@web-std/file](https://www.npmjs.com/package/@web-std/file) - doesn't work in jsdom, only node.js, **don't use it**

- mock Blob with [blob-polyfill](https://www.npmjs.com/package/blob-polyfill)

```ts
yarn add -D blob-polyfill

// jest.setup.ts
import { Blob } from 'blob-polyfill';

// mock Blob with polyfill
global.Blob = Blob;

// useUpdateUser.ts getImage()
// replace File with Blob - works
const file = new File([response.data], 'default-image');

const file = new Blob([response.data], { type: 'image/jpeg' });
file['lastModifiedDate'] = new Date();
file['name'] = 'default-image';

return file as File;
// debug
// const text = await file.text();
// console.log('text', text);
```

- mock `URL.createObjectURL` [jsdom-worker](https://github.com/developit/jsdom-worker), **this works**

```ts
// jest.config.js
setupFiles: ['jsdom-worker'];
```

- wait for more than one element to disapear

```ts
await waitForElementToBeRemoved(() => [
  screen.getByTestId(/header\-placeholder/i),
  screen.getByTestId(/avatar\-placeholder/i),
]);
```

- jest log upside down, first error at bottom...
- userEvent v14 breaking changes `clear()` (select text and delete input) and `type()` [docs](https://testing-library.com/docs/user-event/utility)

```ts
// utils
userEvent.clear();
userEvent.type(); // utility api
userEvent.click(); // convinience api
// keyboard, pointer...
const user = userEvent.setup();

await user.keyboard('[ShiftLeft>]'); // > hold key, /release
await user.click(element);
```

```ts
// v13 working
// edit name
userEvent.type(nameInput, `{selectall}${updatedName}`);

// click submit
const submitButton = screen.getByRole('button', {
  name: /submit/i,
});

userEvent.click(submitButton);

// ------------

// v14 working
// edit name
await userEvent.clear(nameInput);
await userEvent.type(nameInput, updatedName);

// click submit
const submitButton = screen.getByRole('button', {
  name: /submit/i,
});

await userEvent.click(submitButton);
```

- wrapped in act warning - something async is out of order and not awaited, race and state update, forms e.g., events, (react state update is always async)

- submit form without button click

```ts
import { fireEvent } from '@testing-library/react';

fireEvent.submit(searchInput); // or form element
// enter key
fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
```

- problem: msw handler not fired and console logging, solution: order of handlers is wrong, route is overridden by other handler, move it to top, **actually:** routes overlap, must be in same handler with switch statement, Next.js handles priority by default

- useSession in useMe needs SessionProvider to call msw `/api/auth/session/` endpoint

```ts
const { result, waitFor } = renderHook(() => useMe(), {
  wrapper: createWrapper(), // here
});
```

- who sets `process.env.NODE_ENV === 'test'`

- hooks test examples [github](https://github.com/juliencrn/usehooks-ts/tree/master/lib/src)

- useViewport hook test [github](https://github.com/juliencrn/usehooks-ts/blob/master/lib/src/useWindowSize/useWindowSize.test.ts)

- assert element content `expect(screen.getByTestId('my-test-id')).toHaveTextContent('some text');`

- problem: cant find element by role, solution: `getByRole()` is in describe block instead od test block

- :root element <html /> `screen.debug(document.documentElement)`, assert class `expect(element).toHaveClass('some-class')`

- search input validation error message test [toHaveErrorMessage docs github](https://github.com/testing-library/jest-dom#tohaveerrormessage)
- [Bruno Antunes Youtube](https://www.youtube.com/watch?v=MhFSuOjU624)

```tsx
// aria tags for toHaveErrorMessage()
<input
  aria-errormessage="search-err-msg-id"
  aria-invalid="true"
/>
<p id="search-err-msg-id">err msg</p>

// no error message regex `.+` - at least 1 char
expect(searchInput).not.toHaveErrorMessage(/.+/i);
```

- test happy path form onSubmit

```tsx
// mock
const onSubmit = jest.fn();
// clear just that mock
afterEach(() => {
  onSubmit.mockClear();
});
// pass
customRender(<SearchInput onSearchSubmit={onSubmit} />);
// assert
expect(onSubmit).toHaveBeenCalledWith(inputText);
```

- clear one and all mocks

```ts
// must be declared in describe scope to be cleaned in afterEach()
const onSubmit = jest.fn();

// ones with jest.clearAllMocks(); can be defined in local test scope

afterEach(() => {
  // one
  onSubmit.mockClear();
  // all
  jest.clearAllMocks();
});
```

### Suspense

- when wrapped with Suspense and `suspense: true` in React Query initially always loader is dispalyed
- `await screen.findByText()` IS solution because you need to wait a bit more, or you will get empty `<body><div/></body>`
- **point** - wait for final wanted elements with `findById`, not all intermediate loaders one by one with `waitForToBeRemoved`

```ts
customRender(<Footer />);
// either wait for loader to disappear
await waitForElementToBeRemoved(() => screen.getByTestId(/loading/i));

// or retry first element - preferred solution
const contentText = await screen.findByText(/footer 2022/i);
```

### Error 500 handlers

- cant listen with 2 handlers on same route
- mock console.log(), error(), warn()
- run sequentionally with `jest --runInBand`, `server.resetHandlers()` is broken?

```ts
const mockedConsoleError = jest.spyOn(console, 'error').mockImplementation();
...
mockedConsoleError.mockRestore(); // clean
```

- test error 500 useQuery, must be wrapped with `<SuspenseWrapper />`, and ` suspense: true, useErrorBoundary: true` is in `queryClientConfig` so `result.current.isError` is undefined, you must assert message text on ErrorBoundary **component**, hook is rendered inside a component, use `import { screen } from '@testing-library/react'` screen from rtl import

- only for mutations ErrorBoundary is disabled `useErrorBoundary: false`

```ts
// result.current=null

test('fail 500 query user hook', async () => {
  const mockedConsoleError = jest.spyOn(console, 'error').mockImplementation();

  const params: UserGetQueryParams = { username: fakeUser.username };

  // return 500 from msw
  errorHandler500();
  renderHook(() => useUser(params), {
    wrapper: createWrapper(),
  });

  // uses ErrorBoundary, isError is undefined
  // queries: { suspense: true, useErrorBoundary: true }
  // assert ErrorBoundary and message and not result.current.isError
  const errorBoundaryMessage = await screen.findByTestId(/error\-boundary\-test/i);
  expect(errorBoundaryMessage).toHaveTextContent(errorMessage500);

  mockedConsoleError.mockRestore();
});
```

- error handling with Axios interceptor for transforming error, for side-effects React Query global handler is enough

```ts
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      suspense: true,
      useErrorBoundary: true,
    },
    mutations: {
      useErrorBoundary: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => console.error('global Query error handler:', error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => console.error('global Mutation error handler:', error),
  }),
};
```

- msw concurrent run limitation [issue](https://github.com/mswjs/msw/issues/474)

### Node.js Api unit testing

- unit services: input - argument object, mock prisma, assert service output
- unit controllers: input - http supertest, mock service, assert http response and status, assert service mock calledWithArgs
- always mock one layer bellow
- any class can be unit tested

#### Services unit tests

- Prisma client is mocked, singleton or dependency injection
- Prisma [docs](https://www.prisma.io/docs/guides/testing/unit-testing) - unit testing db services

- assert rejected promise [stackoverflow](https://stackoverflow.com/a/58326750/4383275)
- assert ApiError `toBeInstanceOf()` and set correct constructor name [stackoverflow](https://stackoverflow.com/questions/68899615/how-to-expect-a-custom-error-to-be-thrown-with-jest)

#### Controllers unit tests

- controller needs to be isolated from db to be unit tested
- TomDoesTech Youtube tutorial [Github repo](https://github.com/TomDoesTech/Testing-Express-REST-API), mock service value `.mockReturnValueOnce(userPayload);` and assert service input args `expect(createUserServiceMock).toHaveBeenCalledWith(userInput);`, unit for controllers, service mocked, controller forwards same input to service, supertest, ok

- supertest testClient with Next.js [dev.to tutorial](https://dev.to/noclat/build-a-full-api-with-next-js-1ke), [stackoverflow example](https://stackoverflow.com/questions/66446689/next-js-mock-api-endpoints-send-params-in-req-body-for-post)

```ts
// match part of the object, ignore Date()
expect(body).toEqual(
  expect.objectContaining({
    id: fakePostWithAuthor.id,
    title: fakePostWithAuthor.title,
    content: fakePostWithAuthor.content,
  })
);

// partial match nested object
expect(nestedObject).toEqual(
  expect.objectContaining({
    payload: expect.objectContaining({
      specific: 'specific value',
    }),
  })
);
```

### Node.js Api integration testing

- test database in Docker
- Prisma [docs](https://www.prisma.io/docs/guides/testing/integration-testing)
- connect to test db with `env.test.local`, `DATABASE_URL`, so it can be remote db

- entire test env should be decoupled from dev, db + node.js
- seed/trunc db for each tests suite in beforeAll, afterAll, describe or test file
- for each tests run create/destroy Docker container `docker-compose up -d`, `docker-compose down`
- asserts with database queries
- cannot start app without seed data

- Hashnode Github Actions integration [tutorial](https://blog.ludicroushq.com/a-better-way-to-run-integration-tests-with-prisma-and-postgresql), [Github](https://github.com/ludicroushq/prisma-integration-test-example)
- replaces PrismaClient with mock `prisma/__mocks__/index.ts` and `jest.mock('./prisma/index');` (real file)
- run Postgres directly in Github Actions
- `.env.test` and `.env.dev`?

- docs example [testing-express](https://github.com/prisma/prisma-examples/tree/latest/typescript/testing-express), integration tests, supertest, sqlite, `prisma-test-environment.js` class

- service unit with test db, asserts by reading db, integration with createServer(), fetch and test db, 2 containers Node.js and Postgres, Github Actions example code, Dev.to [tutorial](https://dev.to/eddeee888/how-to-write-tests-for-prisma-with-docker-and-jest-593i), Github [repo](https://github.com/eddeee888/topic-prisma-testing)

- productioncoder [youtube](https://www.youtube.com/watch?v=Fa-oNdqOOYg&list=PL1Nml43UBm6eTkjJtAPfdfjk-x2I_1r-Y&index=6), [Github](https://github.com/productioncoder/test-node-with-docker), test.sh pg_ready, migrations postgres volume

- Github Actions postgres docker-compose up [Github](https://github.com/andersnylund/next-js-prisma-integration-tests)

- must create user in db before post, so it can connect, and for logged in user mock
- must mock logged in user for protected endpoints, maybe possible to manipulate req object

```ts
// mock logged in user
// todo: maybe this is possible without mock, manipulate req object
const mockedGetMeService = jest.spyOn(usersService, 'getMe').mockResolvedValue(author);
```

- use describe blocks and afterAll() to delete all tables for new context

### Multiple Jest projects - client, server

- [tutorial](https://homoly.me/posts/organizing-tests-with-jest-projects)
- [stackoverflow](https://stackoverflow.com/questions/47192083/how-do-you-setup-multiple-jest-configs-within-a-single-project)
- [gist example](https://gist.github.com/wldcordeiro/6dc2eb97a26a52d548ed4aa86f2fc5c0)
- [base config](https://orlandobayo.com/blog/monorepo-testing-using-jest/)

- for Api unit tests services layer is required

- userEvent v14 `click(), clear(), type()` must be wrapped in act, bug, Github [issue](https://github.com/testing-library/user-event/issues/938#issuecomment-1111976312)
- all tests fail in parallel because of this
- **MUST run in sequence for msw 500**

### Docker test environment (local testing only)

- both database and node.js containers
- same env for integration api test and cypress e2e
- derived from prod, no edit, no install packages, frontend prod build
- both Dockerfile.test (from dev, simple enough) and docker-compose.test.yml (from prod) in pair
- Docker only for local test run, in GA it runs directly in os
- dont drop database, create and destroy container
- `POSTGRES_DB=nextjs_prisma_test_db` in .env file will create db in container

- order:

  1. Start the container and create the database
  2. Migrate the schema
  3. Run the tests
  4. Destroy the container

- app works without seed, just migrated schema without data
- app built in Dockerfile, no volumes and live reload, simple
- no, build app in container runtime - cant rebuild while app is running, but it will rebuild just app without container
- seed in beforeAll in tests only
- change postgres port to 5435 so test-db container can run concurrently with dev-db

```yml
# docker-compose.test.yml
npb-db-test:
  # change internal port
  command: postgres -p 5435
  # expose it to host
  ports:
    - '5435:5435'
```

```bash
# .env.test.local
POSTGRES_PORT=5435
```

- app is not running so `NODE_ENV=test` probably? api integration `test`, Cypress `production`
- basically you just need test database
- cant run dev and test concurrently node_modules are shared, so use same port
- volumes so you just rebuild app and not container, Dockerfile CMD too
- PrismaClient singleton for seed [stackoverflow](https://stackoverflow.com/a/57455542/4383275)
- separate yarn script for integration tests because unit tests dont need database
- seed not needed in beforeAll()

```js
// singleton class example
class PrismaSingleton {
  constructor(prisma) {
    this.prisma = prisma;
    PrismaSingleton.instance = this;
  }

  static getInstance() {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaSingleton(new PrismaClient());
    }
    return PrismaSingleton.instance;
  }
}
```

### Run tests in Docker, yarn scripts

- `wait-for-it.sh ip:port` needed only when tests run on host, otherwise `depends_on` works

### Github Actions test CI

- Github [repo](https://github.com/eddeee888/topic-prisma-testing)

### Jest-preview

- Github Next.js example [Readme](https://github.com/nvh95/jest-preview/tree/main/examples/nextjs)
- ignore missing Tailwind inport for now...

```ts
yarn jest-preview

import { debug } from 'jest-preview';

debug();
```

### Fix act Jest warning

- if expect() isn't for element selected with `await findBy()` you need to retry with `await waitFor()` to assert state update on UI

```ts
await userEvent.click(createButton);

await waitFor(() =>
  expect(titleInput).toHaveErrorMessage(/must contain at least 6 character/i)
);
await waitFor(() =>
  expect(contentTextArea).toHaveErrorMessage(/must contain at least 6 character/i)
);
```

### userEvent v14 clear() bug

```ts
// views/Settings/Settings.test.tsx
// views/Create/Create.test.tsx

// NOTE: this fixes a bug in userEvent.clear() or React Hook Form
// field is frozen for first 2 characters
// user0 name + 123 -> user0 name3
await userEvent.type(nameInput, '123');

// edit name
await userEvent.clear(nameInput);
expect(nameInput).toHaveValue(''); // now it works
```

### Wrapped in act() errors

- me context that fetches me asynchronously, me resolves after test finishes
- otherwise await findBy suspense in Wrapper

```tsx
// pass me sync in test-client/Wrapper.tsx
<MeContext.Provider value={{ me: fakeUser }}>{children}</MeContext.Provider>
```

- in `components/SearchInput/SearchInput.test.tsx` solution was to remove unnecessary submit fireEvent to trigger validation messages, they are onChange already, only first time

- **wrong way:** (causes act error)

```ts
await userEvent.type(searchInput, searchTerm);

// submit form
act(() => {
  fireEvent.submit(searchInput);
});
```

- **right way:**

```ts
// type and submit
await userEvent.type(searchInput, `${searchTerm}{enter}`);
```

- Github [issue](https://github.com/testing-library/react-testing-library/issues/551#issuecomment-652401388)

### Jest coverage

- in some branch...? [Kent Dodds repo](https://github.dev/kentcdodds/jest-cypress-react-babel-webpack)
- setup coverage folders (both test files and coverage report with html) for both `jest.client.js` and `jest.server.js`

- just `jest --coverage` flag in existing commands, and that's it

```ts
// jest.config.js
// select tests
collectCoverageFrom[/**/*.ts] // by default ignores *.test.ts files

coveragePathIgnorePatterns: [
  '/node_modules/',
  '/__tests__/',
  '__server_tests__/',
],

// coverage folder, default beside jest.server.js probably
// jest.server.js
coverageDirectory: path.join(__dirname, '../coverage/server'), // for server

// scripts - separate jest run for each project, don't use this
"test:coverage": "yarn test:coverage:client && test:coverage:server",
"test:coverage:client": "jest --config test/jest.client.js --coverage",
"test:coverage:server": "jest --config test/jest.server.js --coverage",

```

- **coverage must be defined once in root `jest.config.js` (where are `projects`)**, and not in `jest.client.js` and `jest.server.js` (jest coverage projects monorepo)
- as stated here: github [issue](https://github.com/facebook/jest/issues/4255), and here [stackoverflow](https://stackoverflow.com/questions/64281758/jest-coveragedirectory-configuration-for-project-inside-monorepo)

- **scripts final:**

```ts
// deafult jest.config.js in root and /coverage dir
"test:coverage": "jest -i --coverage",
```

- **jest.config.js with --projects option, final:**

```ts
module.exports = {
  projects: [
    '<rootDir>/test-client/config/jest.config.js',
    '<rootDir>/test-server/config/jest.config.unit.js',
    '<rootDir>/test-server/config/jest.config.integration.js',
  ],
  // coverage must be set up in this file
  // and run all tests at once
  collectCoverageFrom: [
    // include -----------------------
    // client code
    'layouts/**/*.{ts,tsx}',
    'views/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    // client hooks
    'lib-client/**/*.{ts,tsx}',
    // server code
    'lib-server/**/*.{ts,tsx}',
    // client + server
    'pages/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    // ignore, must come after -------
    '!node_modules',
    '!.next',
    '!dist',
    '!prisma',
    '!themes',
    '!test-client',
    '!test-server',
    '!tests-api',
    '!tests-e2e',
    '!notes',
    '!server',
    '!types',
  ],
  // this is default, can be undefined
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
};
```

- none of the jest tests needs prod built app, only app source; only e2e Cypress needs built prod app

```ts
"test:client": "",
"test:server:unit": "",

// does NOT need built app
// needs only migrated test-db
"test:server:integration": "",

// just uses mounted app source and overrides CMD from Dockerfile.test with run sh-c '...'
// maybe can use sh -c 'prisma:migrate:prod && yarn test:server:integration'",
"docker:test:server:integration": "docker-compose -f docker-compose.test.yml -p npb-test run --rm npb-app-test sh -c 'yarn test:server:integration'",

```

- increase timeout in findBy()

```ts
const title = await screen.findByRole(
  'heading',
  {
    name: RegExp(`${fakeUser.name}`, 'i'),
  },
  { timeout: 2000 } // default 1000, failed in GA
);
expect(title).toBeInTheDocument();
```
