export const ChaiDraggableBlock = ({ children, ...rest }: { children: React.ReactNode, draggable?: boolean, onDragStart?: (e: React.DragEvent) => void, onDragEnd?: (e: React.DragEvent) => void }) => {
    return <div {...rest}>{children}</div>;
};