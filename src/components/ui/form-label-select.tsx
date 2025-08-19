"use client";

import {useEffect, useRef, useState} from "react";


interface LabelSelectProps {
    label: string; // 라벨 명
    value: string | string[]; // 선택된 값 (단일 또는 다중)
    onChange: (value: string | string[]) => void; // 값 변경 이벤트
    options: { label: string; value: string }[]; // 드롭다운 옵션
    disabled?: boolean;
    selectWidth?: string; // Tailwind width class
    isError?: boolean;
    type?: "select" | "multi";
}

export const FormLabelSelect: React.FC<LabelSelectProps> = ({
                                                                label,
                                                                value,
                                                                onChange,
                                                                options,
                                                                disabled = false,
                                                                selectWidth = "w-[150px]",
                                                                isError = false,
                                                                type = "select",
                                                            }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const errorClass = isError
        ? "border-red-600 bg-red-50 focus:ring-red-500 focus:border-red-600"
        : "border-gray-400 bg-white focus:ring-blue-600 focus:border-blue-600";

    const disabledClass = disabled
        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
        : "bg-white text-gray-900";

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Multi select 값 처리
    const selectedValues = Array.isArray(value) ? value : [value];
    const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

    const handleMultiSelectChange = (optionValue: string) => {
        if (disabled) return;

        const currentValues = Array.isArray(value) ? value : [];
        let newValues: string[];

        if (currentValues.includes(optionValue)) {
            // 이미 선택된 경우 제거
            newValues = currentValues.filter(v => v !== optionValue);
        } else {
            // 선택되지 않은 경우 추가
            newValues = [...currentValues, optionValue];
        }

        onChange(newValues);
    };

    // Multi select 표시 텍스트
    const getMultiSelectDisplayText = () => {
        if (!Array.isArray(value) || value.length === 0) {
            return "선택하세요";
        }

        if (value.length === 1) {
            const option = options.find(opt => opt.value === value[0]);
            return option?.label || value[0];
        }

        // 2개 이상 선택된 경우 모든 선택된 값들을 쉼표로 연결해서 표시
        const selectedLabels = value.map(val => {
            const option = options.find(opt => opt.value === val);
            return option?.label || val;
        });

        return selectedLabels.join(", ");
    };

    return (
        <div className={`flex items-center space-x-2 text-center`}>
            <label className="text-sm font-medium text-gray-700 min-w-[100px] text-right">
                {label}
                {isError && <span className="text-red-600 ml-1">*</span>}
            </label>

            {type === "select" ? (
                <select
                    value={Array.isArray(value) ? value[0] || "" : value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    disabled={disabled}
                    className={`${selectWidth || "flex-1"}
                                min-h-[30px] 
                                border-2
                                ${errorClass}
                                ${disabledClass}
                                rounded-md 
                                px-3 
                                py-1.5 
                                text-sm 
                                font-medium
                                shadow-sm 
                                transition-all 
                                duration-200
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-offset-1
                                hover:border-gray-500
                                `}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : type === "multi" ? (
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={`${selectWidth || "flex-1"}
                                    min-h-[30px] 
                                    border-2
                                    ${errorClass}
                                    ${disabledClass}
                                    rounded-md 
                                    px-3 
                                    py-1.5 
                                    text-sm 
                                    font-medium
                                    shadow-sm 
                                    transition-all 
                                    duration-200
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-offset-1
                                    hover:border-gray-500
                                    flex
                                    items-center
                                    justify-between
                                    `}
                    >
                        <span className="truncate text-left">
                            {getMultiSelectDisplayText()}
                        </span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>

                    {isOpen && (
                        <div
                            className={`absolute z-50 mt-1 ${selectWidth || "w-full"} bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto`}>
                            {options.map((opt) => (
                                <label
                                    key={opt.value}
                                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected(opt.value)}
                                        onChange={() => handleMultiSelectChange(opt.value)}
                                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-gray-900">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};