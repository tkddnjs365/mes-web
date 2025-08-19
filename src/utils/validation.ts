export interface RequiredField {
    field: string | string[];
    name: string;
    key: string; // 필드 식별용
}

export interface ValidationResult {
    isValid: boolean;
    message: string;
    invalidKeys: string[]; // 어떤 필드가 잘못됐는지
}

export const validateRequiredFields = (
    fields: RequiredField[]
): ValidationResult => {
    const invalidKeys: string[] = [];

    for (const {field, key} of fields) {
        let isEmpty = false;

        if (Array.isArray(field)) {
            // 배열인 경우 빈 배열이거나 길이가 0이면 invalid
            isEmpty = field.length === 0;
        } else {
            // 문자열인 경우 빈 문자열이거나 공백만 있으면 invalid
            isEmpty = !field || field.trim() === "";
        }

        if (isEmpty) {
            invalidKeys.push(key);
        }
    }

    if (invalidKeys.length > 0) {
        const firstInvalid = fields.find(f => f.key === invalidKeys[0]);
        return {
            isValid: false,
            message: `${firstInvalid?.name}은(는) 필수 입력 항목입니다.`,
            invalidKeys,
        };
    }

    return {isValid: true, message: "", invalidKeys: []};
};