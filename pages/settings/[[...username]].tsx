import { FC } from 'react';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from 'react-query';
import PageLayout from 'layouts/PageLayout';
import SettingsView from 'views/Settings';
import QueryKeys from 'lib-client/react-query/queryKeys';
import { getMe, getUserByIdOrUsernameOrEmail } from 'lib-server/services/users';
import { Redirects } from 'lib-client/constants';
import CustomHead from 'components/CustomHead';
import { ssrNcHandler } from 'lib-server/nc';
import { ClientUser, UserGetData } from 'types/models/User';
import { QueryParamsType } from 'types';
import { validateUserSearchQueryParams } from 'lib-server/validation';

const Settings: FC = () => {
  return (
    <>
      <CustomHead title="Settings" description="Settings" />
      <PageLayout>
        <SettingsView />
      </PageLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const callback1 = async () => await getMe({ req });
  const me = await ssrNcHandler<ClientUser | null>(req, res, callback1);

  if (!me) return Redirects.LOGIN;

  // if my username trim url

  // get username or id
  let _params: QueryParamsType = {};
  if (params?.username) {
    if (me.role === 'admin') {
      _params = { username: params?.username[0] };
    } else {
      return Redirects.NOT_FOUND;
    }
  } else {
    _params = { id: me.id };
  }

  if (!_params.username && !_params.id) {
    return Redirects.NOT_FOUND;
  }

  const callback2 = async () => {
    const parsedData: UserGetData = validateUserSearchQueryParams(_params);
    return await getUserByIdOrUsernameOrEmail(parsedData);
  };
  const user = await ssrNcHandler<ClientUser>(req, res, callback2);

  if (!user) return Redirects.NOT_FOUND;

  // check username first
  const subKey = _params.username || _params.id;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery([QueryKeys.USER, subKey], () => user);
  await queryClient.prefetchQuery([QueryKeys.ME, me.id], () => me);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Settings;
