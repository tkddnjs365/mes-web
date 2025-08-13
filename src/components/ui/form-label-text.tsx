"use client";

interface LabelTextProps {
    label: string; // 라벨 명
    value: string; // 값
    onChange: (value: string) => void; // 값 변경 이벤트
    placeholder?: string;
    disabled?: boolean;
    inputWidth?: string;
    type?: "text" | "textarea" | "numeric"; // 명확한 타입 지정
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

            {type === "text" ? (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    className={`${inputWidth || "flex-1"}
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
                    placeholder={placeholder}
                    disabled={disabled}
                    required
                />
            ) : type === "textarea" ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    className={`${inputWidth || "flex-1"}
                min-h-[100px] 
                border-2
                bg-white 
                ${errorClass}
                ${disabledClass}
                rounded-md 
                px-3 
                py-1.5 
                text-sm 
                font-medium
                shadow-sm 
                resize-none
                transition-all 
                duration-200
                focus:outline-none 
                focus:ring-2 
                focus:ring-offset-1
                hover:border-gray-500
                leading-5
              `}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            ) : type === "numeric" ? (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    className={`${inputWidth || "flex-1"}
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
                    placeholder={placeholder}
                    disabled={disabled}
                    required
                />
            ) : null}
        </div>
    );
};