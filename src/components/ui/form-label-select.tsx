"use client";

interface LabelSelectProps {
    label: string; // 라벨 명
    value: string; // 선택된 값
    onChange: (value: string) => void; // 값 변경 이벤트
    options: { label: string; value: string }[]; // 드롭다운 옵션
    disabled?: boolean;
    selectWidth?: string; // Tailwind width class
    isError?: boolean;
}

export const FormLabelSelect: React.FC<LabelSelectProps> = ({
                                                                label,
                                                                value,
                                                                onChange,
                                                                options,
                                                                disabled = false,
                                                                selectWidth = "w-[150px]",
                                                                isError = false,
                                                            }) => {
    const errorClass = isError
        ? "border-red-600 bg-red-50 focus:ring-red-500 focus:border-red-600"
        : "border-gray-400 bg-white focus:ring-blue-600 focus:border-blue-600";

    const disabledClass = disabled
        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
        : "bg-white text-gray-900";

    return (
        <div className={`flex items-center space-x-2 text-center`}>
            <label className="text-sm font-medium text-gray-700 min-w-[100px] text-right">
                {label}
                {isError && <span className="text-red-600 ml-1">*</span>}
            </label>
            <select
                value={value}
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
        </div>
    );
};