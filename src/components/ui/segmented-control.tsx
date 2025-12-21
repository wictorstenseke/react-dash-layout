import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ButtonGroup orientation="horizontal" className={cn("w-fit", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onValueChange(option.value)}
            aria-pressed={isSelected}
            aria-label={`${option.label} mode`}
            className={cn("transition-all", isSelected && "shadow-sm")}
          >
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
