"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    endTime: Date | string | number; // Date object, ISO string, or timestamp
    startTime?: Date | string | number;
    onComplete?: () => void;
    variant?: "default" | "compact" | "minimal";
    className?: string;
    showLabels?: boolean;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

export function CountdownTimer({
    endTime,
    startTime,
    onComplete,
    variant = "default",
    className = "",
    showLabels = true,
}: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
    });
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const end = typeof endTime === "string" ? new Date(endTime).getTime() :
                         typeof endTime === "number" ? endTime :
                         endTime.getTime();

            const start = startTime ? (typeof startTime === "string" ? new Date(startTime).getTime() :
                                      typeof startTime === "number" ? startTime :
                                      startTime.getTime()) : 0;

            // Check if sale hasn't started yet
            if (start && now < start) {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    total: -1, // Not started
                };
            }

            const difference = end - now;

            if (difference <= 0) {
                setIsComplete(true);
                onComplete?.();
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    total: 0,
                };
            }

            setIsComplete(false);

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
                total: difference,
            };
        };

        setTimeRemaining(calculateTimeRemaining());

        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, startTime, onComplete]);

    const formatTime = (value: number) => value.toString().padStart(2, "0");

    if (isComplete) {
        return (
            <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
                <Clock size={16} />
                <span className="font-bold uppercase text-xs tracking-wider">Sale Ended</span>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <Clock className="text-accent" size={14} />
                <span className="font-black text-sm">
                    {formatTime(timeRemaining.hours)}:{formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
                </span>
            </div>
        );
    }

    if (variant === "minimal") {
        return (
            <div className={`font-mono text-sm ${className}`}>
                {formatTime(timeRemaining.hours)}:{formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
            </div>
        );
    }

    // Default variant with individual boxes
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {timeRemaining.days > 0 && (
                <>
                    <TimeBox value={formatTime(timeRemaining.days)} label={showLabels ? "Days" : ""} />
                    <span className="text-gray-400 font-bold">:</span>
                </>
            )}
            <TimeBox value={formatTime(timeRemaining.hours)} label={showLabels ? "Hours" : "Hrs"} />
            <span className="text-gray-400 font-bold">:</span>
            <TimeBox value={formatTime(timeRemaining.minutes)} label={showLabels ? "Mins" : "Min"} />
            <span className="text-gray-400 font-bold">:</span>
            <TimeBox value={formatTime(timeRemaining.seconds)} label={showLabels ? "Secs" : "Sec"} />
        </div>
    );
}

interface TimeBoxProps {
    value: string;
    label: string;
}

function TimeBox({ value, label }: TimeBoxProps) {
    return (
        <div className="bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[60px] text-center">
            <span className="block text-lg font-black">{value}</span>
            {label && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                </span>
            )}
        </div>
    );
}

// Hook for programmatic access to countdown
export function useCountdown(endTime: Date | string | number) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime();
            const end = typeof endTime === "string" ? new Date(endTime).getTime() :
                         typeof endTime === "number" ? endTime :
                         endTime.getTime();
            return Math.max(0, end - now);
        };

        setTimeRemaining(calculate());

        const timer = setInterval(() => {
            const remaining = calculate();
            setTimeRemaining(remaining);
            if (remaining === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return timeRemaining;
}
