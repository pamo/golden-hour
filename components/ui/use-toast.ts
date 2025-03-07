'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

export type ToastActionElement = React.ReactElement;

export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

const listeners: ((state: ToasterToast[]) => void)[] = [];

let memoryState: ToasterToast[] = [];

function dispatch(action: {
  type: (typeof actionTypes)[keyof typeof actionTypes];
  toast?: ToasterToast;
  toastId?: string;
}) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function reducer(
  state: ToasterToast[],
  action: {
    type: (typeof actionTypes)[keyof typeof actionTypes];
    toast?: ToasterToast;
    toastId?: string;
  }
) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return [...state, { ...(action.toast as ToasterToast) }].slice(0, TOAST_LIMIT);

    case actionTypes.UPDATE_TOAST:
      return state.map((t) => (t.id === action.toastId ? { ...t, ...action.toast } : t));

    case actionTypes.DISMISS_TOAST:
      return state.map((t) => (t.id === action.toastId ? { ...t, open: false } : t));

    case actionTypes.REMOVE_TOAST:
      return state.filter((t) => t.id !== action.toastId);

    default:
      return state;
  }
}

function useToast() {
  const [state, setState] = useState<ToasterToast[]>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const toast = useCallback(({ ...props }: Omit<ToasterToast, 'id'>) => {
    const id = genId();

    const update = (props: ToasterToast) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: props,
        toastId: id,
      });

    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      dismiss,
      update,
    };
  }, []);

  return {
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast };
