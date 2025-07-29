/* 날짜를 한국에 맞춰서 변환 */
export function formatToKoreanDate(value: string | Date | undefined | null): string {
    if (!value) return "";
    const date = new Date(value);
    const formatted = date.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    return formatted.replace(/\./g, "-").replace(" ", "").trim();
}
