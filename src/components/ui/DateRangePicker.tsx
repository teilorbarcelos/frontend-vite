import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/utils/cn";

interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = "Selecione um período",
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-10 border-gray-200 rounded-xl px-3",
              !value && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={1}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
