import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import axiosInstance from 'lib-client/react-query/axios';
import { Routes } from 'lib-client/constants';
import { PostWithAuthor, PostUpdateMutationData } from 'types/models/Post';
import QueryKeys from 'lib-client/react-query/queryKeys';

const updatePost = async ({ id, post }: PostUpdateMutationData) => {
  const { data } = await axiosInstance.patch<PostWithAuthor>(
    `${Routes.API.POSTS}${id}`,
    post
  );
  return data;
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<PostWithAuthor, Error, PostUpdateMutationData, unknown>(
    (data) => updatePost(data),
    {
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries([QueryKeys.POSTS_DRAFTS]),
          queryClient.invalidateQueries([QueryKeys.POSTS_HOME]),
          queryClient.invalidateQueries([QueryKeys.POSTS_PROFILE]),
          queryClient.invalidateQueries([QueryKeys.POST, data.id]),
        ]);

        const postHref = {
          pathname: `/[username]${Routes.SITE.POST}[id]`,
          query: { username: data.author.username, id: data.id },
        };
        await router.push(postHref);
      },
    }
  );

  return mutation;
};
