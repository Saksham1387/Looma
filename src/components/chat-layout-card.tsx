import Image from "next/image";

export const ChatLayoutCard = () => {
  return (
    <div className="w-full  animate-fade-in flex flex-col items-center justify-center">
      <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
        <Image src="/logo (1).png" alt="logo" width={30} height={30} />
        <h3 className="text-2xl font-bold mb-2 text-slate-200">Looma</h3>
        <p className="text-slate-400">
          Enter a prompt to generate a mathematical animation video
        </p>
      </div>
    </div>
  );
};
