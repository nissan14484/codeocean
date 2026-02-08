import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Alert, Table } from "antd";
import type { TableProps } from "antd";

const DEFAULT_HEADER_HEIGHT = 56;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_THRESHOLD_RATIO = 0.1;

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
    thresholdRatio?: number;
};

const components = {
    header: {
        wrapper: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
            <thead {...props} data-role="lazy-table-head" />
        ),
    },
};

export function LazyTable<T extends object>({
    columns,
    height,
    width,
    rowKey = "id",
    extraOffset = 0,
    fetchPage,
    pageSize = DEFAULT_PAGE_SIZE,
    thresholdRatio = DEFAULT_THRESHOLD_RATIO,
}: LazyTableProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const pageRef = useRef(0);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const element = containerRef.current;
        const header = element.querySelector(
            "[data-role='lazy-table-head']"
        ) as HTMLElement | null;
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

    const loadPage = useCallback(
        async (pageToLoad: number) => {
            if (loadingRef.current || !hasMoreRef.current) return;
            if (pageToLoad <= pageRef.current) return;

            setLoading(true);
            setError(null);

            const result = await fetchPage(pageToLoad, pageSize);

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
                return;
            }

            const nextItems = result.data ?? [];
            setItems((prev) => (pageToLoad === 1 ? nextItems : [...prev, ...nextItems]));
            setPage(pageToLoad);
            if (nextItems.length < pageSize) setHasMore(false);
            setLoading(false);
        },
        [fetchPage, pageSize]
    );

    useEffect(() => {
        setItems([]);
        setPage(0);
        setHasMore(true);
        loadPage(1);
    }, [loadPage]);

    const handleScroll = useCallback(
        (event: React.UIEvent<HTMLElement>) => {
            const target = event.currentTarget as HTMLElement;
            const scrollTop = target.scrollTop;
            const scrollHeight = target.scrollHeight;
            const clientHeight = target.clientHeight;
            const scrollable = scrollHeight - clientHeight;

            if (scrollable <= 0) return;

            const remaining = scrollHeight - scrollTop - clientHeight;
            const threshold = scrollable * thresholdRatio;

            if (remaining <= threshold) {
                loadPage(pageRef.current + 1);
            }
        },
        [thresholdRatio, loadPage]
    );

    const scrollY = Math.max(0, height - headerHeight - extraOffset);

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
                components={components}
                onScroll={handleScroll}
            />
        </div>
    );
}
