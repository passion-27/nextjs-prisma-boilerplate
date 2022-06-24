import { DefaultBodyType, PathParams, rest } from 'msw';
import { Session } from 'next-auth';
import { fakeSession } from 'test-client/server/fake-data';
import { Routes } from 'lib-client/constants';
import { ClientUser } from 'types/models/User';

const authHandlers = [
  // useSession, getSession
  rest.get<DefaultBodyType, PathParams, Session>(Routes.API.SESSION, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(fakeSession));
  }),
  // useCreateUser
  rest.post<DefaultBodyType, PathParams, ClientUser>(
    Routes.API.USERS,
    (req, res, ctx) => {
      const user = req.body as ClientUser; // just forward what you received
      return res(ctx.status(200), ctx.json(user));
    }
  ),
];

export default authHandlers;
