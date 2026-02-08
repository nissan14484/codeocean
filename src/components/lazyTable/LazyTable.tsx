import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Alert, Table } from "antd";
import type { TableProps } from "antd";

const DEFAULT_HEADER_HEIGHT = 56;
const DEFAULT_PAGE_SIZE = 100;

type LazyTableProps<T extends object> = {
    columns: TableProps<T>["columns"];
    height: number;
    width?: number | string;
    rowKey?: TableProps<T>["rowKey"];
    extraOffset?: number;
    fetchPage: (page: number, pageSize: number) => Promise<{
        data: T[] | null;
        error: { message: string } | null;
    }>;
    pageSize?: number;
};

export function LazyTable<T extends object>({
    columns,
    height,
    width,
    rowKey = "id",
    extraOffset = 0,
    fetchPage,
    pageSize = DEFAULT_PAGE_SIZE,
}: LazyTableProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const element = containerRef.current;
        const header = element.querySelector(".ant-table-thead") as HTMLElement | null;
        if (!header) return;

        const updateHeaderHeight = () => {
            const next = header.getBoundingClientRect().height;
            if (next > 0 && next !== headerHeight) {
                setHeaderHeight(next);
            }
        };

        updateHeaderHeight();

        const observer = new ResizeObserver(updateHeaderHeight);
        observer.observe(header);
        return () => observer.disconnect();
    }, [headerHeight]);

    const scrollY = Math.max(0, height - headerHeight - extraOffset);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);

            const result = await fetchPage(1, pageSize);

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
                return;
            }

            setItems(result.data ?? []);
            setLoading(false);
        };

        void load();
    }, [fetchPage, pageSize]);

    return (
        <div ref={containerRef} style={{ height, width }}>
            {error && <Alert type="error" message={error} showIcon />}
            <Table
                rowKey={rowKey}
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={false}
                virtual
                sticky
                scroll={{ y: scrollY }}
            />
        </div>
    );
}
