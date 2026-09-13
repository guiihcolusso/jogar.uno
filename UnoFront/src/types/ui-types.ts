/* eslint-disable @typescript-eslint/no-empty-object-type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type As<Props = any> = React.ElementType<Props>
export type PropsOf<T extends As> = React.ComponentPropsWithoutRef<T> & { as?: As }

export type RightJoinProps<SourceProps extends object = {}, OverrideProps extends object = {}> = Omit<
  SourceProps,
  keyof OverrideProps
> &
  OverrideProps

export type MergeWithAs<
  ComponentProps extends object,
  AsProps extends object,
  AdditionalProps extends object = {},
  AsComponent extends As = As,
> = (RightJoinProps<ComponentProps, AdditionalProps> | RightJoinProps<AsProps, AdditionalProps>) & { as?: AsComponent }
