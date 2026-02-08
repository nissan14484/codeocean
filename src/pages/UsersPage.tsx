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

    const fetchPage = useCallback((page: number, pageSize: number) => {
        const start = (page - 1) * pageSize;
        return fetchUsers({ _start: start, _limit: pageSize });
    }, []);

    return (
        <div style={{ height: "100vh", width: "100vw" }}>
            <LazyTable<Person>
                columns={columns}
                height={tableHeight}
                width={tableWidth}
                fetchPage={fetchPage}
            />
        </div>
    );
}
