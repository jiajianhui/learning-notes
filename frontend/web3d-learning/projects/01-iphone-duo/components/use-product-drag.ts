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
    const native = event.nativeEvent;
    const samples = native.getCoalescedEvents?.() ?? [];
    const { clientWidth, clientHeight } = event.currentTarget;
    const touch = event.pointerType === 'touch';
    for (const sample of samples) {
      moveDrag(input.current, sample.clientX, sample.clientY, clientWidth, clientHeight, sample.timeStamp, touch);
    }
    moveDrag(input.current, event.clientX, event.clientY, clientWidth, clientHeight, event.timeStamp, touch);
  }

  function finish(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    if (input.current.pointerId !== event.pointerId) return;
    if (!cancelled) move(event);
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
