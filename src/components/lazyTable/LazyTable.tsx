import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Alert, Input, Table, Typography } from "antd";
import type { TableProps } from "antd";

const { Title } = Typography;

const DEFAULT_HEADER_HEIGHT = 56;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_THRESHOLD_RATIO = 0.1;
const DEFAULT_DEBOUNCE_MS = 400;

type LazyTableProps<T extends object> = {
    columns: TableProps<T>["columns"];
    height: number;
    width?: number | string;
    rowKey?: TableProps<T>["rowKey"];
    extraOffset?: number;
    fetchPage: (page: number, pageSize: number, searchKey: string) => Promise<{
        data: T[] | null;
        error: { message: string } | null;
    }>;
    pageSize?: number;
    thresholdRatio?: number;
    showSearch?: boolean;
    title?: string;
    debounceMs?: number;
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
    showSearch = false,
    title,
    debounceMs = DEFAULT_DEBOUNCE_MS,
}: LazyTableProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const titleRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLDivElement | null>(null);

    const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchKey, setSearchKey] = useState("");
    const [debouncedSearchKey, setDebouncedSearchKey] = useState("");
    const [extraBarsHeight, setExtraBarsHeight] = useState(0);

    const pageRef = useRef(0);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const searchRefValue = useRef("");

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        searchRefValue.current = debouncedSearchKey;
    }, [debouncedSearchKey]);

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

    useLayoutEffect(() => {
        const updateExtraBarsHeight = () => {
            const titleHeight = titleRef.current?.getBoundingClientRect().height ?? 0;
            const searchHeight = searchRef.current?.getBoundingClientRect().height ?? 0;
            setExtraBarsHeight(titleHeight + searchHeight);
        };

        updateExtraBarsHeight();

        const observer = new ResizeObserver(updateExtraBarsHeight);
        if (titleRef.current) observer.observe(titleRef.current);
        if (searchRef.current) observer.observe(searchRef.current);

        return () => observer.disconnect();
    }, [title, showSearch]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedSearchKey(searchKey);
        }, debounceMs);

        return () => clearTimeout(handle);
    }, [searchKey, debounceMs]);

    const loadPage = useCallback(
        async (pageToLoad: number, overrideSearchKey?: string) => {
            if (loadingRef.current || !hasMoreRef.current) return;
            if (pageToLoad !== 1 && pageToLoad <= pageRef.current) return;

            setLoading(true);
            setError(null);

            const key = overrideSearchKey ?? searchRefValue.current;
            const result = await fetchPage(pageToLoad, pageSize, key);

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
        searchRefValue.current = debouncedSearchKey;
        setItems([]);
        setPage(0);
        pageRef.current = 0;
        setHasMore(true);
        hasMoreRef.current = true;
        loadPage(1, debouncedSearchKey);
    }, [loadPage, debouncedSearchKey]);

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
                void loadPage(pageRef.current + 1);
            }
        },
        [thresholdRatio, loadPage]
    );

    const scrollY = Math.max(0, height - headerHeight - extraBarsHeight - extraOffset);

    return (
        <div ref={containerRef} style={{ height, width, display: "flex", flexDirection: "column" }}>
            {title && (
                <div ref={titleRef} style={{ padding: "12px 12px 0 12px" }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {title}
                    </Title>
                </div>
            )}
            {showSearch && (
                <div ref={searchRef} style={{ padding: "8px 12px" }}>
                    <Input
                        placeholder="Search by name or email"
                        value={searchKey}
                        onChange={(event) => setSearchKey(event.target.value)}
                        allowClear
                    />
                </div>
            )}
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
