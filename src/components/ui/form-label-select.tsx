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
    const errorClass = isError ? "border-red-500" : "border-gray-300";

    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.currentTarget.value)}
                disabled={disabled}
                className={`bg-white min-h-[30px] ${selectWidth} border ${errorClass} rounded-md px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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