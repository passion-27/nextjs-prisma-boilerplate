import React, { FC, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { withBem } from 'utils/bem';
import moment from 'moment';
import { useRouter } from 'next/router';
import { getIsAdmin, getIsPostOwner } from 'lib-client/permissions';
import { getAvatarPath, uploadsImageLoader } from 'lib-client/imageLoaders';
import { momentFormats } from 'lib-server/constants';
import Button from 'components/Button';
import { useUpdatePost } from 'lib-client/react-query/posts/useUpdatePost';
import { useDeletePost } from 'lib-client/react-query/posts/useDeletePost';
import { usePost } from 'lib-client/react-query/posts/usePost';
import { Routes } from 'lib-client/constants';
import Alert from 'components/Alert';
import { MeContext } from 'lib-client/providers/Me';

const Post: FC = () => {
  const b = withBem('post');

  const { me } = useContext(MeContext);

  const router = useRouter();
  // getServerSideProps will validate id
  const id = Number(router.query?.id);

  // redirect on delete
  const { data: post, isFetching } = usePost(id);

  const { mutate: updatePost, ...restUpdate } = useUpdatePost();
  const { mutate: deletePost, ...restDelete } = useDeletePost();

  if (!post) return null;

  const { author } = post;

  const authorHref = {
    pathname: '/[username]',
    query: { username: author.username },
  };

  const editPostHref = `${Routes.SITE.CREATE}${post.id}/`;

  const title = `${post.title} ${post.published ? '' : '(Draft)'}`;
  const isOwnerOrAdmin = me && (getIsPostOwner(me, post) || getIsAdmin(me));

  return (
    <article className={b()}>
      {restUpdate.isError && <Alert variant="error" message={restUpdate.error.message} />}

      {restDelete.isError && <Alert variant="error" message={restDelete.error.message} />}

      <h1 className={b('title')}>{title}</h1>
      {/* category, tags */}

      <div className={b('author')}>
        {/* user avatar, name, username, post date */}
        <div className={b('author-card')}>
          <Link href={authorHref}>
            <a className={b('left')}>
              <Image
                loader={uploadsImageLoader}
                src={getAvatarPath(author)}
                width={80}
                height={80}
                alt={author.name ?? 'avatar'}
                objectFit="cover"
              />
            </a>
          </Link>

          <div className={b('right')}>
            <div className={b('author-info')}>
              <Link href={authorHref}>
                <a className={b('name')}>{author.name}</a>
              </Link>
              <Link href={authorHref}>
                <a className={b('username')}>{` · @${author.username}`}</a>
              </Link>
            </div>

            <div className={b('post-created-at')}>
              {moment(post.createdAt).format(momentFormats.dateForUsersAndPosts)}
            </div>
          </div>
        </div>

        <div className={b('buttons')}>
          {isOwnerOrAdmin && (
            <div className={b('publish-delete')}>
              {!post.published && (
                <Button
                  onClick={() => updatePost({ id: post.id, post: { published: true } })}
                >
                  {!restUpdate.isLoading ? 'Publish' : 'Submiting...'}
                </Button>
              )}

              <Link href={editPostHref}>
                <a>
                  <Button tagName="span">Edit</Button>
                </a>
              </Link>

              <Button
                variant="secondary"
                onClick={() => {
                  deletePost(post.id, {
                    onSuccess: async (data) => {
                      data.published === false
                        ? router.push(Routes.SITE.DRAFTS)
                        : router.back();
                    },
                  });
                }}
              >
                {!restDelete.isLoading || isFetching ? 'Delete' : 'Deleting...'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={b('content')}>{post.content}</div>
    </article>
  );
};

export default Post;
