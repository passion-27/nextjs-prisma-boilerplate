import React from 'react';
import { PostWithAuthorStr } from 'types';
import Link from 'next/link';
import { withBem } from 'utils/bem';
import { getAvatarPath } from 'utils';
import moment from 'moment';
import { publishOrDeletePost } from 'components/PostItem/PostReused';

type PostProps = {
  post: PostWithAuthorStr;
  showPublishDeleteButtons: boolean;
};

const Post: React.FC<PostProps> = ({ post, showPublishDeleteButtons }) => {
  const b = withBem('post');

  const { author } = post;

  const authorHref = {
    pathname: '/[username]',
    query: { username: author.username },
  };

  const title = `${post.title} ${post.published ? '' : '(Draft)'}`;

  return (
    <article className={b()}>
      <div className={b('hero')}>
        <img
          className={b('hero-image')}
          src="https://wilcity.com/wp-content/uploads/2020/03/39875853-header-wallpapers.jpg"
        />

        {showPublishDeleteButtons && (
          <div className={b('publish-delete')}>
            {!post.published && (
              <button onClick={() => publishOrDeletePost(post.id, 'publish')}>
                Publish
              </button>
            )}
            <button onClick={() => publishOrDeletePost(post.id, 'delete')}>Delete</button>
          </div>
        )}
      </div>

      <h2 className={b('title')}>{title}</h2>
      {/* category, tags */}

      {/* user avatar, name, username, post date */}
      <div className={b('author-card')}>
        <Link href={authorHref}>
          <a className={b('left')}>
            <img className={b('avatar')} src={getAvatarPath(author)} />
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
            {moment(post.createdAt).format('MMMM d, YYYY')}
          </div>
        </div>
      </div>

      <div className={b('content')}>{post.content}</div>
    </article>
  );
};

export default Post;
