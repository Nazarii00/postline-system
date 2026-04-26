    

export const ErrorMsg = ({ field, errors }: { field: string; errors: Record<string, string> }) => {
  if (!errors[field]) return null;
  
  return (
    <p className="text-rose-500 text-[10px] font-bold mt-1 leading-tight italic">
      {errors[field]}
    </p>
  );
};