import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from 'test-client/test-utils';
import { useUpdateUser } from 'lib-client/react-query/users/useUpdateUser';
import { fakeUser } from 'test-client/server/fake-data';
import { UserUpdateData, UserUpdateMutationData } from 'types/models/User';

describe('useUpdateUser', () => {
  // todo: this fails because of not returned data from FormData msw
  test('successful update user mutation hook', async () => {
    const username = 'updatedUsername';

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    const { mutate } = result.current;

    const mutationVariables: UserUpdateMutationData = {
      id: fakeUser.id,
      user: { ...fakeUser, username } as UserUpdateData,
      setProgress: jest.fn(), // onUploadProgress undefined msw, not supported in msw
    };
    mutate(mutationVariables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.username).toBe(username);
  });
});
