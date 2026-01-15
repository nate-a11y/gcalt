'use client';

import * as React from 'react';
import { cn } from './utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

function Avatar({ className, ref, ...props }: AvatarProps) {
  return (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  ref?: React.Ref<HTMLImageElement>;
}

function AvatarImage({ className, ref, ...props }: AvatarImageProps) {
  return <img ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />;
}

function AvatarFallback({ className, ref, ...props }: AvatarProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
