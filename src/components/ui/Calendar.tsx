import { buttonVariants } from "@/components/ui/button-variants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/utils/cn";
import * as React from "react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      captionLayout="dropdown"
      startMonth={new Date(currentYear - 20, 0)}
      endMonth={new Date(currentYear + 20, 11)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-2 relative items-center h-9 mb-2",
        caption_label: "hidden",
        nav: "hidden",
        dropdowns: "flex gap-2 items-center justify-center w-full",
        dropdown: "flex items-center",
        dropdown_month: "flex items-center",
        dropdown_year: "flex items-center",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-gray-500 rounded-md w-10 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white",
        today: "bg-gray-100 text-gray-900",
        outside: "text-gray-500 opacity-50",
        disabled: "text-gray-500 opacity-50",
        range_middle:
          "aria-selected:bg-gray-100 aria-selected:text-gray-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, options }) => {
          const selected = options?.find((option) => option.value === value);
          
          const handleValueChange = (newValue: string) => {
            const event = {
              target: {
                value: newValue,
              },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(event);
          };

          return (
            <Select
              value={value?.toString()}
              onValueChange={handleValueChange}
            >
              <SelectTrigger 
                className="h-8 w-auto border-none bg-transparent hover:bg-gray-100 focus:ring-0 font-bold text-sm capitalize px-2 gap-1 shadow-none"
              >
                <SelectValue>{selected?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent 
                className="max-h-[200px] overflow-y-auto min-w-[120px]"
                position="popper"
              >
                {options?.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value.toString()}
                    className="capitalize"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
