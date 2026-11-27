'use client';

import { useRef } from 'react';
import type { PointerEvent } from 'react';
import { beginDrag, createDragState, endDrag, moveDrag, resetDrag } from '@/lib/drag-motion';

export function useProductDrag() {
  const input = useRef(createDragState());

  function start(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || input.current.pointerId !== null) return;
    beginDrag(input.current, event.pointerId, event.clientX, event.clientY, event.timeStamp);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (input.current.pointerId !== event.pointerId) return;
    moveDrag(input.current, event.clientX, event.clientY,
      event.currentTarget.clientWidth, event.currentTarget.clientHeight,
      event.timeStamp, event.pointerType === 'touch');
  }

  function finish(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    if (input.current.pointerId !== event.pointerId) return;
    endDrag(input.current, event.timeStamp, cancelled);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    input,
    reset: () => resetDrag(input.current),
    handlers: {
      onPointerDown: start,
      onPointerMove: move,
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event, false),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
    },
  };
}
