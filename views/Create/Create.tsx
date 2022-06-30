import React, { FC, useEffect } from 'react';
import NextError from 'next/error';
import { getErrorClass, withBem } from 'utils/bem';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postCreateSchema } from 'lib-server/validation';
import Button from 'components/Button';
import { useCreatePost } from 'lib-client/react-query/posts/useCreatePost';
import { usePost } from 'lib-client/react-query/posts/usePost';
import { useUpdatePost } from 'lib-client/react-query/posts/useUpdatePost';
import Alert from 'components/Alert';
import { PostCreateFormData } from 'types/models/Post';

type Props = {
  testOnSubmit?: (data: PostCreateFormData) => void;
};

const Create: FC<Props> = ({ testOnSubmit }) => {
  const b = withBem('create');
  const router = useRouter();

  const id = Number(router.query?.id?.[0]);
  const { data: post } = usePost(id);
  const isUpdate = !!post;
  const isEnabled = !isNaN(id);

  const { mutate: updatePost, ...restUpdate } = useUpdatePost();
  const { mutate: createPost, ...restCreate } = useCreatePost();

  const onSubmit = async ({ title, content }: PostCreateFormData) => {
    // just for testing
    process.env.NODE_ENV === 'test' && testOnSubmit?.({ title, content });
    isUpdate
      ? updatePost({ id: post.id, post: { title, content } })
      : createPost({ title, content });
  };

  const { register, handleSubmit, formState, getValues, reset } =
    useForm<PostCreateFormData>({
      resolver: zodResolver(postCreateSchema),
      defaultValues: {
        title: '',
        content: '',
      },
    });

  // async load post like user in Settings form
  useEffect(() => {
    if (post) {
      reset({
        ...getValues(),
        title: post.title,
        content: post.content,
      } as PostCreateFormData);
    }
  }, [post]);

  const { errors } = formState;

  // invalid id in url
  if (id && !post) return <NextError statusCode={404} />;

  // maybe disabled query is stuck in loading state...

  return (
    <div className={b()}>
      <h1 className={b('title')}>{!isUpdate ? 'Create new draft' : 'Edit post'}</h1>

      <form className={b('form')} onSubmit={handleSubmit(onSubmit)}>
        {restCreate.isError && (
          <Alert variant="error" message={restCreate.error.message} />
        )}

        {restUpdate.isError && (
          <Alert variant="error" message={restUpdate.error.message} />
        )}

        <div className={b('form-field')}>
          <label htmlFor="title">Title</label>
          <input
            {...register('title')}
            id="title"
            type="text"
            className={getErrorClass(errors.title?.message)}
            aria-errormessage="create-title-err-msg-id"
            aria-invalid="true"
          />
          <p
            id="create-title-err-msg-id"
            className={getErrorClass(errors.title?.message)}
          >
            {errors.title?.message}
          </p>
        </div>

        <div className={b('form-field')}>
          <label htmlFor="content">Content</label>
          <textarea
            {...register('content')}
            id="content"
            rows={8}
            className={getErrorClass(errors.content?.message)}
            aria-errormessage="create-content-err-msg-id"
            aria-invalid="true"
          />
          <p
            id="create-content-err-msg-id"
            className={getErrorClass(errors.content?.message)}
          >
            {errors.content?.message}
          </p>
        </div>

        <div className={b('buttons')}>
          <Button type="submit" disabled={restCreate.isLoading || restUpdate.isLoading}>
            {!isUpdate && (!restCreate.isLoading ? 'Create' : 'Submiting...')}
            {isUpdate && (!restUpdate.isLoading ? 'Update' : 'Submiting...')}
          </Button>
          <span>or</span>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className={b('cancel')}
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default Create;
