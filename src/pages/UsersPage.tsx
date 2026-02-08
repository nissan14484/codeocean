import { useCallback, useEffect, useState } from "react";
import { fetchUsers } from "../api/users/users";
import type { Person } from "../api/types";
import { LazyTable } from "../components/lazyTable/LazyTable";

const columns = [
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Catch Phrase", dataIndex: "catchPhrase", key: "catchPhrase" },
    { title: "Comments", dataIndex: "comments", key: "comments" },
];

export function UsersPage() {
    const [tableHeight, setTableHeight] = useState(window.innerHeight);
    const [tableWidth, setTableWidth] = useState(window.innerWidth);

    useEffect(() => {
        const onResize = () => {
            setTableHeight(window.innerHeight);
            setTableWidth(window.innerWidth);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const fetchPage = useCallback((page: number, pageSize: number, searchKey: string) => {
        const start = (page - 1) * pageSize;
        const q = searchKey.trim();
        return fetchUsers({ _start: start, _limit: pageSize, q: q || undefined }).then(
            (result) => {
                console.log("111");
                if (!q || result.error || !result.data) return result;
                console.log("result: ", result);

                const term = q.toLowerCase();
                const filtered = result.data.filter((user) => {
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

                return { data: filtered, error: null };
            }
        );
    }, []);

    return (
        <div style={{ height: "100vh", width: "100vw" }}>
            <LazyTable<Person>
                title="Users"
                showSearch
                columns={columns}
                height={tableHeight}
                width={tableWidth}
                fetchPage={fetchPage}
            />
        </div>
    );
}
