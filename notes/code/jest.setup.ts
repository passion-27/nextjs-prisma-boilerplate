import '@testing-library/jest-dom';
import { server } from 'test-client/server';
import { Blob } from 'blob-polyfill';

console.log('jest.setup.ts loaded...');

// The current testing environment is not configured to support act(…)
// doesnt work
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// TypeError: window.matchMedia is not a function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// mock Blob with polyfill (and File)
global.Blob = Blob;

// msw
beforeAll(() => server.listen());
afterEach(() =>  server.resetHandlers());
afterAll(() => server.close());
