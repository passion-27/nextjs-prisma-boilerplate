import ApiError from 'lib-server/error';
import prisma, { excludeFromUser } from 'lib-server/prisma';
import { hash } from 'bcryptjs';
import { getSession, GetSessionParams } from 'next-auth/react';
import { PaginatedResponse, SortDirection } from 'types';
import {
  ClientUser,
  UserCreateData,
  UserGetData,
  UsersGetData,
  UserUpdateServiceData,
} from 'types/models/User';
import { filterSearchTerm } from 'utils';

/**
 *
 * @returns null on fail, doesn't throw exception, user is not logged in
 *
 */
export const getMe = async (params: GetSessionParams): Promise<ClientUser | null> => {
  const session = await getSession(params);
  const id = session?.user?.id;

  if (!id) return null;

  const me = await prisma.user.findUnique({ where: { id } });

  if (!me) return null;

  return excludeFromUser(me);
};

// -------- pages/api/users/[id].ts

export const getUser = async (id: string): Promise<ClientUser> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(`User with id: ${id} not found.`, 404);

  return excludeFromUser(user);
};

export const updateUser = async (
  id: string,
  userUpdateData: UserUpdateServiceData
): Promise<ClientUser> => {
  const { name, username, bio, password, files } = userUpdateData; // email reconfirm...

  // validate userId
  const _user = await prisma.user.findUnique({ where: { id } });
  if (!_user) throw new ApiError(`User with id: ${id} not found.`, 404);

  // check if new username is available
  if (username && username !== _user.username) {
    const _user = await prisma.user.findFirst({
      where: { username },
    });
    if (_user) throw new ApiError(`Username: ${username} is already taken.`, 409);
  }

  const data = {
    ...(name && { name }),
    ...(username && { username }),
    ...(bio && { bio }),
    ...(files?.avatar?.length > 0 && { image: files.avatar[0].filename }),
    ...(files?.header?.length > 0 && { headerImage: files.header[0].filename }),
    ...(password && { password: await hash(password, 10) }),
  };

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  if (!user) throw new ApiError('Update user failed.', 400);

  return excludeFromUser(user);
};

export const deleteUser = async (id: string): Promise<ClientUser> => {
  // validate id
  const _user = await prisma.user.findUnique({ where: { id } });
  if (!_user) throw new ApiError('User not found.', 404);

  // delete posts too, cascade defined in schema
  const user = await prisma.user.delete({ where: { id } });
  if (!user) throw new ApiError('Delete user failed.', 400);

  return excludeFromUser(user);
};

// -------- pages/api/users/index.ts

export const createUser = async (userCreateData: UserCreateData): Promise<ClientUser> => {
  const { name, username, email, password: _password } = userCreateData;

  // unique email
  const _user1 = await prisma.user.findFirst({
    where: { email },
  });
  if (_user1) throw new ApiError(`User with email: ${email} already exists.`, 409);

  // unique username
  const _user2 = await prisma.user.findFirst({
    where: { username },
  });
  if (_user2) throw new ApiError(`Username: ${username} is already taken.`, 409);

  const password = await hash(_password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password,
      // role: 'user' // create admin through database...
    },
  });

  if (!user) throw new ApiError('User cerate failed.', 400);

  return excludeFromUser(user);
};

const defaultLimit = parseInt(process.env.NEXT_PUBLIC_USERS_PER_PAGE);

export const getUsers = async (
  usersGetData: UsersGetData = {}
): Promise<PaginatedResponse<ClientUser>> => {
  const {
    page = 1,
    limit = defaultLimit,
    searchTerm,
    sortDirection = 'desc',
  } = usersGetData;

  const search = filterSearchTerm(searchTerm, 'or');

  const where = {
    where: {
      ...(search && {
        OR: [{ name: { search } }, { username: { search } }, { email: { search } }],
      }),
    },
  };

  const totalCount = await prisma.user.count({ ...where });

  const users = await prisma.user.findMany({
    ...where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: sortDirection as SortDirection,
    },
  });

  const result = {
    items: users.map((user) => excludeFromUser(user)),
    pagination: {
      total: totalCount,
      pagesCount: Math.ceil(totalCount / limit),
      currentPage: page,
      perPage: limit,
      from: (page - 1) * limit + 1,
      to: (page - 1) * limit + users.length,
      hasMore: page < Math.ceil(totalCount / limit),
    },
  };

  return result;
};

// -------- pages/api/users/profile.ts

export const getUserByIdOrUsernameOrEmail = async (
  userGetData: UserGetData = {}
): Promise<ClientUser> => {
  const { id, username, email } = userGetData;

  const user = await prisma.user.findFirst({
    where: { OR: [{ id }, { username }, { email }] },
  });

  if (!user) throw new ApiError('User not found.', 404);

  return excludeFromUser(user);
};
