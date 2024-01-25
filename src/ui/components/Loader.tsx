// type Props = ComponentProps<"button">;
type LoaderProps = {};

export const Loader = (props: LoaderProps) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-teal-600" />
    </div>
  );
};
