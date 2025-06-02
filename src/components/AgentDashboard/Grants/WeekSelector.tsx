"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Label } from "@/components/shadcn/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Button } from "@/components/shadcn/button";
import { Calendar } from "lucide-react";

interface WeekSelectorProps {
  selectedWeek: string;
  onSelectWeek: (week: string) => void;
}

// Month names in English
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Function to generate weeks for a specific month
const generateWeeksForMonth = (year: number, month: number) => {
  // Get the first day of the selected month
  const firstDayOfMonth = new Date(year, month, 1);

  // Calculate the last day of the selected month
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const weeks = [{ value: "all", label: "All Weeks" }];

  // Generate weeks for the month
  let weekStart = new Date(firstDayOfMonth);
  let weekNumber = 1;

  while (weekStart <= lastDayOfMonth) {
    // End date of the week (6 days after start)
    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // If the end date exceeds the month, adjust it to the last day
    if (weekEnd > lastDayOfMonth) {
      weekEnd = new Date(lastDayOfMonth);
    }

    // Calculate how many days this week has
    const daysInWeek =
      Math.round(
        (weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // If this is the last week and has few days (less than 3),
    // and it's not the first week, extend the previous week to include these days
    if (
      weekEnd.getTime() === lastDayOfMonth.getTime() &&
      daysInWeek < 3 &&
      weeks.length > 1
    ) {
      // Get and modify the previous week
      const lastWeek = weeks[weeks.length - 1];

      // Extract the current end date from the label
      const currentLabel = lastWeek.label;
      const startDateText = currentLabel
        .substring(currentLabel.indexOf("(") + 1, currentLabel.indexOf("-"))
        .trim();

      // Update the label with the new end date
      lastWeek.label = `Week ${
        weekNumber - 1
      } (${startDateText} - ${weekEnd.toLocaleDateString()})`;

      // Exit the loop since we've reached the end of the month
      break;
    } else {
      // Add a new week
      weeks.push({
        value: `week${weekNumber}-${month}-${year}`,
        label: `Week ${weekNumber} (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})`,
      });

      // Advance to the next week
      weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() + 1);
      weekNumber++;
    }
  }

  return weeks;
};

// Component to select month and year
const MonthYearSelector = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}: {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Year</h3>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(year)}
              className="w-full"
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Month</h3>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={index}
              variant={selectedMonth === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMonth(index)}
              className="w-full text-xs"
            >
              {month}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export function WeekSelector({
  selectedWeek,
  onSelectWeek,
}: WeekSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const date = new Date();
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());

  // Generate weeks for the selected month and year
  const weeks = generateWeeksForMonth(selectedYear, selectedMonth);

  // Text to display on the button
  const monthYearText = `${months[selectedMonth]} ${selectedYear}`;

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 mb-2 sm:mb-0"
          >
            <Calendar className="h-4 w-4" />
            <span>{monthYearText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <MonthYearSelector
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        </PopoverContent>
      </Popover>

      <div className="flex items-center space-x-4">
        <Label htmlFor="week-select" className="whitespace-nowrap font-medium">
          Filter by Week:
        </Label>
        <Select value={selectedWeek} onValueChange={onSelectWeek}>
          <SelectTrigger id="week-select" className="w-[250px]">
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {weeks.map((week) => (
              <SelectItem key={week.value} value={week.value}>
                {week.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
