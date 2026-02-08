import { useCallback, useEffect, useState } from "react";
import type { Person } from "../../api/types";
import { LazyTable } from "../../components/lazyTable/LazyTable";
import {fetchReviewers} from "../../api/reviewers/reviewers";
import {personLocalFilter} from "../../utils/personLocalFilter";
import {columns} from "../../App";

export function ReviewersPage({ tableWidth, tableHeight }: { tableWidth: number; tableHeight: number; }) {

    const fetchPage = useCallback((page: number, pageSize: number, searchKey: string) => {
        const start = (page - 1) * pageSize;
        const q = searchKey.trim();
        return fetchReviewers({ _start: start, _limit: pageSize, q: q || undefined }).then(
            (result) => {
                if (!q || result.error || !result.data) return result;
                return { data: personLocalFilter(result.data, q), error: null };
            }
        );
    }, []);

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <LazyTable<Person>
                title="Reviewers"
                showSearch
                columns={columns}
                height={tableHeight}
                width={tableWidth}
                fetchPage={fetchPage}
            />
        </div>
    );
}
