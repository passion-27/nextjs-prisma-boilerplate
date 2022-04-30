import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from 'test-client/test-utils';
import { useMe } from 'lib-client/react-query/auth/useMe';
import { fakeUser } from 'test-client/server/fake-data';

describe('useMe', () => {
  test('successful query hook', async () => {
    // useMe calls useSession() that needs SessionProvider

    const { result } = renderHook(() => useMe(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // assert fakeUser is fetched based on fakeUser.id in session
    expect(result.current.data?.username).toBe(fakeUser.username);
  });
});
