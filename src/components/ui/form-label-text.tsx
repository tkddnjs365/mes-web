"use client";

interface LabelTextProps {
    label: string; // 라벨 명
    value: string; // 값
    onChange: (value: string) => void; // 값 변경 이벤트
    placeholder?: string;
    disabled?: boolean;
    inputWidth?: string;
    type?: "text" | "textarea"; // 명확한 타입 지정
    isError?: boolean;
}

export const FormLabelText: React.FC<LabelTextProps> = ({
                                                            label,
                                                            value,
                                                            onChange,
                                                            placeholder = "",
                                                            disabled = false,
                                                            inputWidth = "",
                                                            type = "text",
                                                            isError = false,
                                                        }) => {
    const errorClass = isError ? "border-red-500" : "border-gray-300";

    return (
        <div className={`flex items-start space-x-2`}>
            <label className="text-sm font-medium text-gray-700 min-w-[60px] text-center pt-1">
                {label}
            </label>

            {type === "text" ? (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    className={`bg-white min-h-[30px] ${inputWidth} border ${errorClass} rounded-md px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={placeholder}
                    disabled={disabled}
                    required
                />
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    className={`bg-white h-[100px] ${inputWidth} border ${errorClass} rounded-md px-3 py-2 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            )}
        </div>
    );
};