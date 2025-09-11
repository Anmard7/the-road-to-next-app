import Link from "next/link";
import { Heading } from "@/components/heading";
import { ticketsPath } from "@/path";
const HomePage = () => {
    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading title="Home" description="Your home page to start"/>
            <div className="mt- flex-1 flex flex-col items-center">
                <Link href = {ticketsPath()} className="underline">
                Go to Ticket</Link>
            </div>
        </div>
    )
}

export default HomePage;