/* 날짜 포맷 변경 - 한국 시간 기준 */
export function formatToKoreanDate(value: string | Date | undefined | null): string {
    if (!value) return "";

    const date = new Date(value);

    // 한국 시간으로 변환 (UTC + 9시간)
    const koreanTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const year = koreanTime.getFullYear();
    const month = String(koreanTime.getMonth() + 1).padStart(2, "0");
    const day = String(koreanTime.getDate()).padStart(2, "0");
    const hour = String(koreanTime.getHours()).padStart(2, "0");
    const minute = String(koreanTime.getMinutes()).padStart(2, "0");
    const second = String(koreanTime.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}