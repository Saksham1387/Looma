import Chatpage from "@/components/chat-window";

const Page = async ({ params }: { params: { id: string } }) => {
  const id = (await params).id;
  return (
    <div>
      <Chatpage id={id} />
    </div>
  );
};

export default Page;
