import React, { CSSProperties, FC, useCallback, useEffect, useState } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { withBem } from 'utils/bem';

interface IFileInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
  dropzoneOptions?: DropzoneOptions;
  altText?: string;
  name: string;
  isLoading?: boolean;
  /** used only to override default height and width */
  imageStyle?: CSSProperties;
}

const DropzoneSingle: FC<IFileInputProps> = ({
  dropzoneOptions,
  name,
  label,
  altText,
  isLoading = false,
  imageStyle,
  ...rest
}) => {
  const b = withBem('dropzone-single');
  const [hover, setHover] = useState(false);

  const { register, unregister, setValue, watch } = useFormContext();
  const file: File = watch(name);

  const onDrop = useCallback<NonNullable<DropzoneOptions['onDrop']>>(
    (droppedFiles) => {
      setValue(name, droppedFiles?.[0], { shouldValidate: true, shouldDirty: true });
    },
    [setValue, name]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...dropzoneOptions,
    onDrop,
  });

  useEffect(() => {
    // same register like on field <input {...register('username')}
    register(name);

    return () => {
      unregister(name);
    };
  }, [register, unregister, name]);

  // do hover in react instead css so both drag and hover can have same styles

  return (
    <div className={b()}>
      <label htmlFor={name} className={b('label')}>
        {label}
      </label>
      {!isLoading ? (
        <div {...getRootProps()}>
          <input {...rest} id={name} name={name} {...getInputProps()} />

          <div
            className={b('preview', { active: isDragActive })}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {file && (
              <>
                <img
                  src={URL.createObjectURL(file)}
                  alt={altText}
                  className={b('image')}
                  style={{ ...imageStyle }}
                />
                <div className={b('overlay', { active: isDragActive || hover })}>
                  <span>
                    {isDragActive && 'Drop here'}
                    {hover && 'Click or \n drag & drop'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={b('placeholder')} style={{ ...imageStyle }} />
      )}
    </div>
  );
};

export default DropzoneSingle;
