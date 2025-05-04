import SignupForm from "@/components/signin-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Auth(){
    const session = await getServerSession();

    if(session){
        redirect("/")
    }
    return(
        <div className="flex items-center justify-center pt-28">
        <SignupForm/>
        </div>
    )
}