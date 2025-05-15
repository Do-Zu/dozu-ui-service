import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

interface Props {
    router?: AppRouterInstance
}

export default function BackButton(props: Props) {
    let { router } = props;
    if(!router) router = useRouter();

    function handleClickBack() {
        router?.back();
    }

    return (
        <Button onClick={handleClickBack} className="flex flex-row items-center">
            <ArrowBigLeft/>
            <div className="text-base" >Back</div>
        </Button>
    )
}