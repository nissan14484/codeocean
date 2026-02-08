import type { Person } from "../api/types";

export function personLocalFilter(data: Person[], q: string): Person[] {
    const term = q.trim().toLowerCase();
    if (!term) return data;

    return data.filter((user) => {
        const first = user.firstName?.toLowerCase() ?? "";
        const last = user.lastName?.toLowerCase() ?? "";
        const email = user.email?.toLowerCase() ?? "";
        const full = `${first} ${last}`.trim();
        return (
            first.includes(term) ||
            last.includes(term) ||
            email.includes(term) ||
            full.includes(term)
        );
    });
}
