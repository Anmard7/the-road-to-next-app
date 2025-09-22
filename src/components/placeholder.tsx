import { LucideMessageSquareWarning } from "lucide-react";
import type { ReactNode } from "react";

type PlaceholderProps = {
    label: string;
    icon?: ReactNode;
    button?: ReactNode;
}

  const Placeholder = ({
    label, 
    icon = <LucideMessageSquareWarning className="h-16 w-16" />, 
    button,
  }: PlaceholderProps) => {
      return (

          <div className="flex-1 self-center flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">{icon}</div>
            <h2 className = "text-lg text-center">{label}</h2>
            {button ? <div className="h-10">{button}</div> : null}
          </div>

    )
}

export { Placeholder };
